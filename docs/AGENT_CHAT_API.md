# InstaGoods AI Agent — Subapp API

A Flask-based AI shopping assistant that wraps the Gemini 2.5 Flash model with live InstaGoods marketplace tools. Runs locally on `http://localhost:5000` by default.

---

## Overview

The agent maintains per-client **sessions** — each session has its own isolated conversation history with Gemini. Clients identify themselves by a `session_id` (UUID string). Sessions live in server memory and are lost on server restart.

**Workflow:**
1. Send a message to `POST /chat` without a `session_id` — the server creates one and returns it.
2. Pass that `session_id` in all subsequent requests to maintain conversation context.
3. Call `DELETE /session/<id>` to reset the conversation.

---

## Endpoints

### `POST /chat`

Send a message to the AI assistant. The assistant can autonomously call marketplace tools (browse categories, search products, get product details) to answer the request.

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | Yes | The user's message |
| `session_id` | string | No | Existing session ID. Omit to auto-create a new session. |

**Example — first message:**
```http
POST /chat
Content-Type: application/json

{ "message": "What food products are available?" }
```

**Example — follow-up in same session:**
```http
POST /chat
Content-Type: application/json

{ "message": "Which of those are under R50?", "session_id": "a1b2c3d4-..." }
```

**Response:**
```json
{
  "reply": "Here are some food products under R50: ...",
  "session_id": "a1b2c3d4-e5f6-..."
}
```

**Error responses:**
- `400` — `message` field missing

---

### `POST /session/new`

Explicitly create a new session without sending a message. Useful when you want to pre-allocate a session ID before the first message.

**Request body:** none

**Example:**
```http
POST /session/new
```

**Response:**
```json
{ "session_id": "a1b2c3d4-e5f6-..." }
```

---

### `DELETE /session/<session_id>`

Delete a session and clear its conversation history. The next message sent with this ID (or a new session) will start fresh.

**Example:**
```http
DELETE /session/a1b2c3d4-e5f6-...
```

**Response:**
```json
{ "deleted": "a1b2c3d4-e5f6-..." }
```

**Error responses:**
- `404` — session not found

---

### `GET /session/<session_id>/history`

Retrieve the full conversation history for a session as an ordered list of messages.

**Example:**
```http
GET /session/a1b2c3d4-e5f6-.../history
```

**Response:**
```json
{
  "session_id": "a1b2c3d4-e5f6-...",
  "history": [
    { "role": "user", "text": "What food products are available?" },
    { "role": "model", "text": "Here are the food categories I found: ..." },
    { "role": "user", "text": "Which are under R50?" },
    { "role": "model", "text": "The following products are under R50: ..." }
  ]
}
```

**Error responses:**
- `404` — session not found

---

### `POST /transcribe`

Transcribe an audio recording to text using Gemini. Used by the web UI for voice input.

**Request:** `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `audio` | file | Audio file (webm, mp4, ogg, wav, etc.) |

**Response:**
```json
{ "transcript": "show me bread under fifty rand" }
```

**Error responses:**
- `400` — no audio file provided
- `500` — transcription failed

---

### `POST /tts`

Convert text to speech using gTTS. Returns an MP3 audio stream. Used by the web UI for voice output.

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | Yes | Text to speak |

**Example:**
```http
POST /tts
Content-Type: application/json

{ "text": "Here are some bread products available near you." }
```

**Response:** `audio/mpeg` binary stream (MP3)

**Error responses:**
- `400` — `text` field missing

---

## Error Format

All error responses follow the same shape:

```json
{ "error": "Description of what went wrong" }
```

| Status | Meaning |
|---|---|
| `400` | Missing or invalid request parameter |
| `404` | Session not found |
| `500` | Server-side error (Gemini, transcription, TTS) |

---

## Session Lifecycle Notes

- Sessions are **in-memory only** — lost on server restart.
- There is no automatic session expiry; unused sessions accumulate until the server restarts or `DELETE /session/<id>` is called.
- The browser UI automatically stores and reuses a `session_id` for the tab's lifetime; refreshing the page starts a new session.
