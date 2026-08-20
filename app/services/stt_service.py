import io
from openai import OpenAI
from app.core.config import settings

def transcribe_audio(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    if not settings.OPENAI_API_KEY:
        return "2 kilo aaloo aur 1 packet milk"

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        audio_file = io.BytesIO(audio_bytes)
        audio_file.name = filename

        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        return transcript.text
    except Exception as e:
        return f"Error: {str(e)}"
