from fastapi import APIRouter

from app.schemas import ProcessVoiceResponse, VoiceRequest
from app.services import parse_voice_transcript

router = APIRouter()


@router.post("/process-voice", response_model=ProcessVoiceResponse)
def process_voice(request: VoiceRequest) -> ProcessVoiceResponse:
    items, reply = parse_voice_transcript(request.transcript)

    return ProcessVoiceResponse(
        status="success",
        transcript=request.transcript,
        extracted_items=items,
        reply=reply,
    )
