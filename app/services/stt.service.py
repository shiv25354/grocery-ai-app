import io
from openai import OpenAI
from app.core.config import settings

def transcribe_audio(audio_bytes: bytes, filename: str = "audio.wav") -> str:
    if not settings.OPENAI_API_KEY:
        return "OpenAI API key missing"

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    # इन-मेमोरी बाइट्स को फ़ाइल ऑब्जेक्ट में बदलना
    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = filename

    # Whisper API से ट्रांसक्रिप्शन (Hinglish/Hindi/English ऑटो डिटेक्ट)
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language="hi"  # या खाली छोड़ सकते हैं ऑटो-डिटेक्शन के लिए
    )
    return transcript.text
