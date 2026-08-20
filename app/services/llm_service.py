from openai import OpenAI
from app.core.config import settings
from app.schemas.voice import VoiceIntentResponse

def get_openai_client():
    if not settings.OPENAI_API_KEY:
        return None
    return OpenAI(api_key=settings.OPENAI_API_KEY)

SYSTEM_PROMPT = """
You are an intelligent multilingual Indian Grocery Voice Assistant.
Extract the user's intent and items from speech/text in Hindi, English, Hinglish, or regional languages.
Map regional units accurately (e.g., 'aadha kilo' -> 0.5 kg, 'paav kilo' -> 0.25 kg, '1 packet' -> 1 packet, '2 piece' -> 2 piece).
Respond with a natural confirmation message in the same language the user spoke.
"""

def process_grocery_voice_text(text: str) -> VoiceIntentResponse:
    client = get_openai_client()
    if not client:
        return VoiceIntentResponse(
            intent="add_to_cart",
            items=[],
            user_language="Hindi/English",
            reply_message="Please add OPENAI_API_KEY in your .env file."
        )

    # OpenAI Structured Outputs with Pydantic
    completion = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text},
        ],
        response_format=VoiceIntentResponse,
        temperature=0.1
    )

    return completion.choices[0].message.parsed
