import os
from pydantic import BaseModel, Field
from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.services.podcast_script import build_podcast_script
from app.services.audio_openai import text_to_mp3_openai, PODCAST_OUT_DIR

router = APIRouter(prefix="/podcast", tags=["podcast-openai"])

class BuildPodcastRequest(BaseModel):
    source_text: str = Field(..., description="Raw text to restructure as a podcast")
    title: str | None = Field(None, description="Episode title")
    target_minutes: int = Field(8, ge=3, le=60)
    segments: int = Field(4, ge=3, le=12)
    tone: str = Field("friendly and informative")
    host_name: str | None = None
    voice: str = Field("onyx", description="OpenAI TTS voice (e.g., alloy, echo, fable, onyx, nova, shimmer)")
    out_name: str | None = Field(None, description="Optional output filename (mp3)")

@router.post("/build-openai")
def build_podcast_openai(req: BuildPodcastRequest):
    """
    1) Restructure the source text into a host-ready script.
    2) Synthesize to MP3 using OpenAI TTS.
    """
    script = build_podcast_script(
        source_text=req.source_text,
        title=req.title,
        target_minutes=req.target_minutes,
        segments=req.segments,
        tone=req.tone,
        host_name=req.host_name,
    )

    out_name = req.out_name or "episode.mp3"
    mp3_path = text_to_mp3_openai(
        text=script,
        voice=req.voice,
        filename=out_name,
    )

    filename = os.path.basename(mp3_path)
    return {
        "title": req.title or "Podcast Episode",
        "voice": req.voice,
        "file": filename,
        "path": mp3_path,
        "download_url": f"/podcast/file/{filename}",
        "script_preview": script[:400] + ("..." if len(script) > 400 else ""),
    }

@router.get("/file/{name}")
def get_podcast_file(name: str):
    path = os.path.join(PODCAST_OUT_DIR, name)
    return FileResponse(path, media_type="audio/mpeg", filename=name)
