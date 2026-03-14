import io
import sys
import json
import logging
import uuid
import requests
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
    about a specific product, such as stock, supplier info, delivery options, and pricing."""
    log.info(f"\n[BACKEND EXECUTING] Fetching product detail for: {product_id}")
    data = _agent_api_get("agent-product-detail", {"id": product_id})
    return json.dumps(data)


CHAT_CONFIG = types.GenerateContentConfig(
    system_instruction="You are a helpful shopping assistant for the InstaGoods marketplace. "
        "You help users browse categories, search for products, and get product details. "
        "Use the available tools to fetch real-time data from the marketplace. "
        "Present results in a friendly, concise way. Include prices in ZAR (R).",
    tools=[get_categories, search_products, get_product_detail],
)

# Session store: maps session_id (str) -> Gemini chat object
# Each session maintains its own conversation history with Gemini.
# Sessions persist in memory until explicitly deleted or the server restarts.
chat_sessions: dict = {}

def _get_or_create_session(session_id: str | None) -> tuple:
    """Return (session_id, chat). Creates a new session if session_id is None or unknown."""
    if session_id and session_id in chat_sessions:
        return session_id, chat_sessions[session_id]
    new_id = str(uuid.uuid4())
    chat_sessions[new_id] = client.chats.create(model="gemini-2.5-flash", config=CHAT_CONFIG)
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
        return jsonify({"transcript": response.text.strip()})
    except Exception as e:
        print(f"Transcription error: {e}")
        return jsonify({"error": "Transcription failed"}), 500


@app.route("/chat", methods=["POST"])
def chat_route():
    body = request.json or {}
    user_message = body.get("message")
    session_id = body.get("session_id")  # optional; omit to auto-create a new session

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    session_id, chat = _get_or_create_session(session_id)
    log.info(f"[CHAT] session={session_id} message={user_message!r}")

    try:
        response = chat.send_message(user_message)
        return jsonify({"reply": response.text, "session_id": session_id})
    except Exception as e:
        log.error(f"[CHAT ERROR] {type(e).__name__}: {e}")
        return jsonify({"reply": f"Sorry, I ran into an error: {e}", "session_id": session_id})


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
    chat = chat_sessions[session_id]
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