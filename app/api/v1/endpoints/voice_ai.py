from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.services.llm_service import process_grocery_voice_text
from app.services.stt_service import transcribe_audio
from app.core.database import supabase

router = APIRouter()

class VoiceInputRequest(BaseModel):
    transcript: str

@router.post("/process-voice")
def handle_voice_order(payload: VoiceInputRequest):
    try:
        parsed_data = process_grocery_voice_text(payload.transcript)
        matched_products = []

        if supabase:
            for item in parsed_data.items:
                res = supabase.table("products").select("*").ilike("name", f"%{item.item_name}%").execute()
                if res.data:
                    matched_products.append({
                        "requested": item.model_dump(),
                        "matched": res.data[0]
                    })

        return {
            "status": "success",
            "intent": parsed_data.intent,
            "reply": parsed_data.reply_message,
            "extracted_items": parsed_data.items,
            "matched_products": matched_products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/process-audio")
async def handle_audio_file(file: UploadFile = File(...)):
    """सीधे ऑडियो फ़ाइल (.wav, .mp3, .m4a) अपलोड करें"""
    try:
        audio_data = await file.read()
        
        # 1. ऑडियो को टेक्स्ट में बदलें (Whisper)
        transcript_text = transcribe_audio(audio_data, file.filename)
        
        # 2. ट्रांसक्रिप्ट को LLM से पार्स करें
        parsed_data = process_grocery_voice_text(transcript_text)
        
        # 3. Supabase से मैच करें
        matched_products = []
        if supabase:
            for item in parsed_data.items:
                res = supabase.table("products").select("*").ilike("name", f"%{item.item_name}%").execute()
                if res.data:
                    matched_products.append({
                        "requested": item.model_dump(),
                        "matched": res.data[0]
                    })

        return {
            "status": "success",
            "transcript": transcript_text,
            "intent": parsed_data.intent,
            "reply": parsed_data.reply_message,
            "extracted_items": parsed_data.items,
            "matched_products": matched_products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
