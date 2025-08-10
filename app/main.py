from fastapi import FastAPI
from app.routers.generation import router as generation_router
from app.routers.podcast_openai import router as podcast_openai_router

app = FastAPI(title="Writing Assistant API")

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

app.include_router(generation_router)
app.include_router(podcast_openai_router)
