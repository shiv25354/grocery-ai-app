from pydantic import BaseModel, Field


class VoiceRequest(BaseModel):
    transcript: str = Field(..., min_length=1)


class VoiceCartItem(BaseModel):
    item_name: str
    quantity: float
    unit: str


class ProcessVoiceResponse(BaseModel):
    status: str
    transcript: str
    extracted_items: list[VoiceCartItem]
    reply: str
