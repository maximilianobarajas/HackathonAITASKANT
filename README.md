
# ANT PODCASTER — README

**Ant Podcaster** is a minimal, fast writing assistant that helps you outline on the left pane and compose on the right—then turns your draft into a short **podcast** via streamed TTS. The backend is **FastAPI** (OpenAI for text + speech), the frontend is plain **HTML/CSS/JS** (with optional **p5.js** for an animated background).
---

## Project description

- **Backend (FastAPI)**
  - Endpoints for:
    - `POST /generate_intro` — model-written introductions.
    - `POST /generate_subtopics?main_topic=&num_topics=` — structured subtopic suggestions.
    - `POST /generate_subtopic_paragraph` — per-subtopic expansions.
    - `POST /podcast/build-openai` — **streams** `audio/mpeg` (TTS) to the browser; no file writes required.
  - Uses OpenAI’s Python SDK for chat completions and text-to-speech.
  - CORS configured for local dev (JSON POSTs from your frontend without preflight 405s).

- **Frontend (Vanilla JS + p5.js)**
  - Left pane: subtopics (drag/drop, duplicate, per-subtopic AI paragraph).
  - Right pane: composer + toolbar + **audio player**.
  - Audio is played from a **blob URL** created from the streamed response:
    - `pause()` → `removeAttribute('src'); load()` → set `audio.src = URL.createObjectURL(blob)` → wait `canplay` → `play()`.
  - Served locally via **VS Code → “Open with Live Server”** from `WEBSITE/WEBSITE/index.html`.

- **Why streaming TTS?**
  - No media files written to disk → no dev-server auto-reloads or UI resets.
  - Faster handoff to `<audio>` with consistent, flicker-free playback.

---

## Setup instructions

### 1) Prerequisites

- **Python 3.11+**  
  Download: https://www.python.org/downloads/
- **Visual Studio Code**  
  https://code.visualstudio.com/
- **Live Server (VS Code extension)** for static frontend hosting  
  https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
- **p5.js** (optional; loaded via CDN in your `index.html`)  
  Getting started: https://p5js.org/tutorials/get-started/

### 2) Clone & structure

```bash
git clone <your-repo-url>
cd <your-repo>
````

Expected structure:

```
.
├─ app/
│  ├─ routers/
│  │  ├─ generation.py
│  │  └─ podcast_openai.py
│  └─ services/
│     ├─ text_generation.py
│     ├─ audio_openai.py
│     └─ ai_client.py
├─ main.py
├─ requirements.txt
├─ .env.example
├─ WEBSITE/
│  └─ WEBSITE/
│     ├─ index.html
│     ├─ style.css
│     ├─ app.js
│     └─ sketch.js   # optional p5.js background
└─ README.md
```

### 3) Python environment

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

**Windows (PowerShell)**

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4) Environment config

Copy and fill your environment file:

```bash
cp .env.example .env
```

`.env` (example):

```dotenv
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=onyx

# Frontend origins allowed during local dev
ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500

# (Only if you choose file-based audio; streaming does not use this)
PODCAST_OUT_DIR=media/podcasts
```

### 5) Run the API

```bash
uvicorn main:app --reload --port 8000
```

Minimal CORS in `main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.generation import router as generation_router
from app.routers.podcast_openai import router as podcast_openai_router

app = FastAPI(title="Ant Podcaster API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500","http://localhost:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello, Ants!"}

app.include_router(generation_router)
app.include_router(podcast_openai_router)
```

### 6) Launch the frontend with **VS Code Live Server**

1. Open **VS Code** in the repo root.
2. Open `WEBSITE/WEBSITE/index.html` in the editor.
3. **Right-click → “Open with Live Server”.**
4. Your browser should open at a URL like:
   `http://127.0.0.1:5500/WEBSITE/WEBSITE/`

> If your API isn’t at `http://127.0.0.1:8000`, update `API.BASE` at the top of `WEBSITE/WEBSITE/app.js`.

### 7) Add p5.js (optional)

In `WEBSITE/WEBSITE/index.html`, include before `sketch.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js"></script>
```

Then ensure `sketch.js` is referenced after p5.

---

## Dependencies / environment files

### `requirements.txt`
```txt
fastapi>=0.115
uvicorn[standard]>=0.30
pydantic>=2.8
python-dotenv>=1.0
httpx>=0.27
openai>=1.40
```

### `.env.example`

```dotenv
OPENAI_API_KEY=
OPENAI_API_BASE=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=onyx
ALLOWED_ORIGINS=http://127.0.0.1:5500,http://localhost:5500
PODCAST_OUT_DIR=media/podcasts
```

---

## API quick reference

* `POST /generate_intro`
  **Body**: `{"main_topic": "Your topic", "word_count": 120}`
  **Returns**: `{"introduction": "..."}`

* `POST /generate_subtopics?main_topic=Topic&num_topics=6`
  **Returns**: `{"subtopics": ["…", "…", ...]}`

* `POST /generate_subtopic_paragraph`
  **Body**: `{"text": "optional context", "subtopic": "Title", "word_count": 180}`
  **Returns**: `{"paragraph": "..."}`

* `POST /podcast/build-openai`
  **Body**:

  ```json
  {
    "source_text": "Full draft text",
    "title": "Episode title",
    "target_minutes": 8,
    "segments": 4,
    "tone": "friendly and informative",
    "voice": "onyx"
  }
  ```

  **Returns**: raw **audio/mpeg** stream (frontend converts to a blob URL and plays).

---

## Troubleshooting

* **405 on `OPTIONS` (CORS preflight)**
  Ensure `CORSMiddleware` is enabled and the Live Server origin (`http://127.0.0.1:5500`) is listed in `allow_origins`.

* **Audio “blink” or UI resets**
  Use **streamed** TTS (no file writes). The frontend swaps audio sources with:

  1. `pause()`
  2. `removeAttribute('src'); load()`
  3. set `src = URL.createObjectURL(blob)`, `load()`
  4. wait for `canplay`, then `play()`

* **404 / wrong API base**
  Verify `API.BASE` in `WEBSITE/WEBSITE/app.js` and that Uvicorn is running on the expected port.

---



---

## Useful links

* Python downloads — [https://www.python.org/downloads/](https://www.python.org/downloads/)
* VS Code — [https://code.visualstudio.com/](https://code.visualstudio.com/)
* Live Server extension — [https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
* p5.js “Get Started” — [https://p5js.org/tutorials/get-started/](https://p5js.org/tutorials/get-started/)
* FastAPI docs — [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
* Uvicorn — [https://www.uvicorn.org/](https://www.uvicorn.org/)
* OpenAI API docs — [https://platform.openai.com/docs/](https://platform.openai.com/docs/)

```

::contentReference[oaicite:0]{index=0}
```
