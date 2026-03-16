import io
import sys
import json
import logging
import uuid
import requests
from contextvars import ContextVar
from urllib.parse import urlencode
from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)  # allows all origins — fine for development

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger(__name__)

# Load environment variables from .env
load_dotenv()

# Initialize the new Gemini client
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

INSTAGOODS_ROOT_URL = os.environ.get("INSTAGOODS_ROOT_URL")

if not INSTAGOODS_ROOT_URL:
    raise RuntimeError(
        "INSTAGOODS_ROOT_URL is not set. Add it to your .env file."
    )

API_BASE = f"{INSTAGOODS_ROOT_URL}/api"

# Thread-safe store for JWT and location: set before every chat.send_message() call
# so tool functions can read them without being Gemini parameters.
_current_jwt: ContextVar[str | None] = ContextVar("current_jwt", default=None)
_current_location: ContextVar[tuple[float, float] | None] = ContextVar("current_location", default=None)

def _agent_api_get(endpoint: str, params: dict | None = None) -> dict:
    """Helper to call the InstaGoods Vercel proxy API."""
    url = f"{API_BASE}/{endpoint}"
    if params:
        url += "?" + urlencode({k: v for k, v in params.items() if v is not None})
    log.info(f"[API REQUEST] GET {url}")
    try:
        resp = requests.get(url, timeout=10)
        log.info(f"[API RESPONSE] {resp.status_code} {url}")
        return resp.json()
    except Exception as e:
        log.error(f"[API ERROR] {e}")
        raise


# --- TOOL FUNCTIONS FOR GEMINI ---

def get_categories() -> str:
    """Get all product categories and subcategories available on the InstaGoods marketplace. Call this when the user wants to know what types of products are available."""
    log.info("\n[BACKEND EXECUTING] Fetching categories")
    data = _agent_api_get("agent-categories")
    return json.dumps(data)


def geocode_address(address: str) -> str:
    """Convert a place name or street address to GPS coordinates (latitude and longitude).
    Use this when the user mentions a specific location by name (e.g. 'near Sandton',
    'in Cape Town', '123 Main St Johannesburg') so you can then pass the coordinates
    to search_products for distance-filtered results."""
    log.info(f"\n[BACKEND EXECUTING] Geocoding address: {address}")
    try:
        resp = requests.post(
            f"{API_BASE}/geocode-proxy",
            json={"address": address},
            timeout=10,
        )
        return json.dumps(resp.json())
    except Exception as e:
        log.error(f"[GEOCODE ERROR] {e}")
        return json.dumps({"error": str(e)})


def search_products(
    category: str | None = None,
    sub_category: str | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    lat: float | None = None,
    lng: float | None = None,
    radius_km: float | None = None,
) -> str:
    """Search and filter products on the InstaGoods marketplace. All parameters are optional.

    IMPORTANT — category hierarchy:
      - 'category' filters by MAIN category (e.g. 'Groceries', 'Physical Goods').
      - 'sub_category' filters by SUB-CATEGORY (e.g. 'Pantry Essentials', 'Jewelry').
    Always use get_categories() first to find valid category/sub_category names.
    If the user mentions a subcategory (like 'Pantry Essentials'), pass it as 'sub_category', NOT as 'category'.

    Other params:
      - 'search': keyword search across product name/description (e.g. 'bread', 'rice')
      - 'min_price'/'max_price': price range filter in ZAR
      - 'lat'/'lng'/'radius_km': sort by distance and filter to nearby products
    """
    # Fall back to the session's stored location if the caller omitted lat/lng
    if lat is None and lng is None:
        stored = _current_location.get()
        if stored:
            lat, lng = stored

    log.info(f"\n[BACKEND EXECUTING] Searching products: category={category}, sub_category={sub_category}, "
          f"search={search}, min_price={min_price}, max_price={max_price}, lat={lat}, lng={lng}, radius_km={radius_km}")
    params = {
        "category": category,
        "sub_category": sub_category,
        "search": search,
        "min_price": min_price,
        "max_price": max_price,
        "lat": lat,
        "lng": lng,
        "radius_km": radius_km,
    }
    data = _agent_api_get("agent-products", params)
    return json.dumps(data)


def get_product_detail(product_id: str) -> str:
    """Get full details for a single product by its ID. Use this when the user wants more information
    about a specific product, such as stock, supplier info, delivery options, and pricing.
    The response includes a 'product_url' field — always share this link with the user so they can view and purchase the product."""
    log.info(f"\n[BACKEND EXECUTING] Fetching product detail for: {product_id}")
    data = _agent_api_get("agent-product-detail", {"id": product_id})
    return json.dumps(data)


def get_cart() -> str:
    """ALWAYS call this tool when the user asks about their cart or what they have added to their cart.
    Do NOT assume the user is logged in or not — always invoke this tool and let the result determine what to tell the user."""
    jwt = _current_jwt.get()
    log.info(f"[TOOL get_cart] _current_jwt.get() = {'<' + jwt[:20] + '...>' if jwt else 'None'}")
    if not jwt:
        return json.dumps({"error": "not_authenticated", "message": "The user is not logged in. Ask them to sign in to view their cart."})
    log.info("\n[BACKEND EXECUTING] Fetching cart")
    data = _agent_api_get("agent-cart", {"user_jwt": jwt})
    return json.dumps(data)


def get_wishlist() -> str:
    """ALWAYS call this tool when the user asks about their wishlist or saved products.
    Do NOT assume the user is logged in or not — always invoke this tool and let the result determine what to tell the user."""
    jwt = _current_jwt.get()
    log.info(f"[TOOL get_wishlist] _current_jwt.get() = {'<' + jwt[:20] + '...>' if jwt else 'None'}")
    if not jwt:
        return json.dumps({"error": "not_authenticated", "message": "The user is not logged in. Ask them to sign in to view their wishlist."})
    log.info("\n[BACKEND EXECUTING] Fetching wishlist")
    data = _agent_api_get("agent-wishlist", {"user_jwt": jwt})
    return json.dumps(data)


CHAT_CONFIG = types.GenerateContentConfig(
    system_instruction="You are a helpful shopping assistant for the InstaGoods marketplace. "
        "You help users browse categories, search for products, get product details, "
        "and view their cart or wishlist. "
        "IMPORTANT: Always use the available tools to fetch real-time data — never guess or answer from memory. "
        "For cart and wishlist requests, always call the tool; the tool itself will handle auth and return the appropriate response. "
        "When the user's GPS coordinates are provided in the message context, use them automatically for product searches. "
        "When the user mentions a place by name, call geocode_address first to obtain coordinates, then pass them to search_products. "
        "Present results in a friendly, concise way. Include prices in ZAR (R).",
    tools=[get_categories, search_products, get_product_detail, get_cart, get_wishlist, geocode_address],
)

# Session store: maps session_id (str) -> {"chat": ChatSession, "user_jwt": str | None}
# Sessions persist in memory until explicitly deleted or the server restarts.
chat_sessions: dict = {}

def _get_or_create_session(session_id: str | None) -> tuple:
    """Return (session_id, session_record). Creates a new session if session_id is None or unknown."""
    if session_id and session_id in chat_sessions:
        return session_id, chat_sessions[session_id]
    new_id = str(uuid.uuid4())
    chat_sessions[new_id] = {
        "chat": client.chats.create(model="gemini-2.5-flash", config=CHAT_CONFIG),
        "user_jwt": None,
        "user_lat": None,
        "user_lng": None,
    }
    log.info(f"[SESSION NEW] {new_id}")
    return new_id, chat_sessions[new_id]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    audio_file = request.files.get("audio")
    if not audio_file:
        return jsonify({"error": "No audio provided"}), 400

    audio_bytes = audio_file.read()
    mime_type = audio_file.content_type or "audio/webm"

    try:
        audio_part = types.Part(inline_data=types.Blob(data=audio_bytes, mime_type=mime_type))
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[audio_part, types.Part(text="Transcribe the speech in this audio. Return only the transcribed words, nothing else.")]
        )
        return jsonify({"transcript": (response.text or "").strip()})
    except Exception as e:
        print(f"Transcription error: {e}")
        return jsonify({"error": "Transcription failed"}), 500


@app.route("/chat", methods=["POST"])
def chat_route():
    body = request.json or {}
    user_message = body.get("message")
    session_id = body.get("session_id")  # optional; omit to auto-create a new session
    user_jwt = body.get("user_jwt")       # optional; the user's Supabase access token
    user_lat = body.get("user_lat")       # optional; GPS latitude from the frontend
    user_lng = body.get("user_lng")       # optional; GPS longitude from the frontend

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    session_id, record = _get_or_create_session(session_id)

    # Update the stored JWT if a fresh one was supplied (handles token refresh and login/logout)
    if user_jwt is not None:
        record["user_jwt"] = user_jwt

    # Update stored coordinates whenever the frontend sends a fresh position
    if user_lat is not None and user_lng is not None:
        record["user_lat"] = float(user_lat)
        record["user_lng"] = float(user_lng)

    chat = record["chat"]
    log.info(
        f"[CHAT] session={session_id} "
        f"jwt_stored={record['user_jwt'] is not None} "
        f"location=({record['user_lat']}, {record['user_lng']}) "
        f"message={user_message!r}"
    )

    # Build the message Gemini receives — prepend a location hint if coordinates are available
    lat_stored = record["user_lat"]
    lng_stored = record["user_lng"]
    if lat_stored is not None and lng_stored is not None:
        gemini_message = (
            f"[Context: User's current GPS location is lat={lat_stored}, lng={lng_stored}. "
            f"Use these coordinates for any location-based product searches unless the user "
            f"explicitly asks to search near a different place.]\n{user_message}"
        )
    else:
        gemini_message = user_message

    # Inject JWT and location into context vars so tool functions can read them
    token_jwt = _current_jwt.set(record["user_jwt"])
    location_tuple = (lat_stored, lng_stored) if lat_stored is not None and lng_stored is not None else None
    token_loc = _current_location.set(location_tuple)
    log.info(f"[CONTEXTVAR SET] jwt={'set' if record['user_jwt'] else 'None'} location={location_tuple}")
    try:
        response = chat.send_message(gemini_message)
        return jsonify({"reply": response.text, "session_id": session_id})
    except Exception as e:
        log.error(f"[CHAT ERROR] {type(e).__name__}: {e}")
        return jsonify({"reply": f"Sorry, I ran into an error: {e}", "session_id": session_id})
    finally:
        _current_jwt.reset(token_jwt)
        _current_location.reset(token_loc)


@app.route("/session/new", methods=["POST"])
def new_session():
    """Explicitly create a new session and return its ID."""
    session_id, _ = _get_or_create_session(None)
    return jsonify({"session_id": session_id})


@app.route("/session/<session_id>", methods=["DELETE"])
def delete_session(session_id):
    """Delete a session, clearing its conversation history."""
    if session_id in chat_sessions:
        del chat_sessions[session_id]
        log.info(f"[SESSION DELETED] {session_id}")
        return jsonify({"deleted": session_id})
    return jsonify({"error": "Session not found"}), 404


@app.route("/session/<session_id>/history", methods=["GET"])
def get_history(session_id):
    """Return the conversation history for a session as a list of {role, text} objects."""
    if session_id not in chat_sessions:
        return jsonify({"error": "Session not found"}), 404
    chat = chat_sessions[session_id]["chat"]
    history = []
    for message in chat.get_history():
        # Each message can have multiple parts; join text parts into one string
        text = " ".join(
            part.text for part in message.parts if hasattr(part, "text") and part.text
        )
        if text:
            history.append({"role": message.role, "text": text})
    return jsonify({"session_id": session_id, "history": history})

@app.route("/tts", methods=["POST"])
def tts():
    text = request.json.get("text")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    mp3_fp = io.BytesIO()
    gTTS(text=text, lang="en").write_to_fp(mp3_fp)
    mp3_fp.seek(0)
    return send_file(mp3_fp, mimetype="audio/mpeg")

if __name__ == "__main__":
    app.run(debug=True)