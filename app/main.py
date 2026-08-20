import re
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import uvicorn

app = FastAPI(title="Grocery AI Backend", version="1.2.0")

# CORS Setup - Allows Next.js frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STORED_ORDERS: List[dict] = [
    {
        "id": "ord_1723908811",
        "user_id": "customer_01",
        "phone_number": "+919876543210",
        "delivery_address": "Flat 402, Green Park, New Delhi",
        "total_amount": 105.0,
        "status": "confirmed",
        "items": [
            {"product_name": "Fresh Potato (Aloo)", "quantity": 2.0, "unit": "kg", "unit_price": 30.0},
            {"product_name": "Brown Bread", "quantity": 1.0, "unit": "packet", "unit_price": 45.0},
        ],
    }
]

CATALOG_ITEMS = [
    {"id": "p1", "name": "Fresh Potato (Aloo)", "keywords": ["aloo", "aalu", "potato", "aaloo"], "unit": "kg", "price": 30.0},
    {"id": "p2", "name": "Fresh Onion (Pyaaz)", "keywords": ["pyaaz", "pyaj", "onion", "kanda"], "unit": "kg", "price": 40.0},
    {"id": "p3", "name": "Fresh Tomato (Tamatar)", "keywords": ["tamatar", "tamater", "tomato"], "unit": "kg", "price": 35.0},
    {"id": "p4", "name": "Brown Bread", "keywords": ["bread", "brown bread", "pav"], "unit": "packet", "price": 45.0},
    {"id": "p5", "name": "Amul Full Cream Milk", "keywords": ["milk", "doodh", "amul doodh", "amul milk"], "unit": "packet", "price": 66.0},
    {"id": "p6", "name": "Basmati Rice", "keywords": ["rice", "chawal", "basmati"], "unit": "kg", "price": 120.0},
    {"id": "p7", "name": "Fortune Sunflower Oil", "keywords": ["oil", "tel", "fortune oil", "refined"], "unit": "liter", "price": 150.0},
    {"id": "p8", "name": "Aashirvaad Atta", "keywords": ["atta", "aashirvaad atta", "gehu"], "unit": "kg", "price": 220.0},
]

class VoicePromptRequest(BaseModel):
    transcript: str

class OrderItem(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    quantity: float
    unit: str
    unit_price: float

class CheckoutRequest(BaseModel):
    user_id: str
    items: List[OrderItem]
    total_amount: float
    delivery_address: str
    phone_number: str

def parse_transcript_logic(transcript: str):
    cleaned = transcript.lower()
    for noise in ["bhaiya", "chahiye", "de do", "de dena", "daal do", "pack karo", "please", "kripya"]:
        cleaned = cleaned.replace(noise, " ")

    num_map = {
        "ek": 1.0, "do": 2.0, "teen": 3.0, "char": 4.0, "paanch": 5.0,
        "one": 1.0, "two": 2.0, "three": 3.0, "four": 4.0, "five": 5.0,
        "aadha": 0.5, "adha": 0.5, "half": 0.5, "paav": 0.25, "dedh": 1.5, "dhai": 2.5
    }

    clauses = re.split(r"\baur\b|\band\b|,", cleaned)
    extracted = []

    for clause in clauses:
        clause = clause.strip()
        if not clause:
            continue

        qty = 1.0
        unit = ""
        words = clause.split()

        for w in words:
            if w in num_map:
                qty = num_map[w]
            elif w.replace(".", "", 1).isdigit():
                qty = float(w)
            elif w in ["kg", "kilo", "killoo", "kgs"]:
                unit = "kg"
            elif w in ["packet", "pkt", "pouch"]:
                unit = "packet"
            elif w in ["liter", "litre", "l"]:
                unit = "liter"
            elif w in ["gram", "gm"]:
                unit = "gram"

        matched_item = None
        for item in CATALOG_ITEMS:
            if any(k in clause for k in item["keywords"]):
                matched_item = item
                break

        if matched_item:
            final_unit = unit if unit else matched_item["unit"]
            if final_unit == "gram" and matched_item["unit"] == "kg":
                qty = qty / 1000.0
                final_unit = "kg"

            extracted.append({
                "product_id": matched_item["id"],
                "product_name": matched_item["name"],
                "quantity": qty,
                "unit": final_unit,
                "unit_price": matched_item["price"]
            })
        else:
            extracted.append({
                "product_id": f"custom_{int(time.time())}",
                "product_name": clause.title(),
                "quantity": qty,
                "unit": unit if unit else "unit",
                "unit_price": 50.0
            })

    if extracted:
        summary = ", ".join([f"{x['quantity']} {x['unit']} {x['product_name']}" for x in extracted])
        reply = f"Cart me add kar diya: {summary}."
    else:
        reply = "Item aur quantity samajh nahi aayi, kripya dobara bolein."

    return extracted, reply

@app.get("/")
def health_check():
    return {"status": "success", "message": "FastAPI is running properly on Port 8000"}

@app.post("/api/v1/voice/process-voice")
async def process_voice(request: VoicePromptRequest):
    if not request.transcript:
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    items, reply = parse_transcript_logic(request.transcript)
    return {"status": "success", "transcript": request.transcript, "extracted_items": items, "reply": reply}

@app.post("/api/v1/orders/checkout")
async def create_checkout(request: CheckoutRequest):
    items_data = [
        item.model_dump() if hasattr(item, "model_dump") else item.dict()
        for item in request.items
    ]
    order_data = {
        "id": f"ord_{int(time.time())}",
        "user_id": request.user_id,
        "phone_number": request.phone_number,
        "delivery_address": request.delivery_address,
        "total_amount": request.total_amount,
        "items": items_data,
        "status": "confirmed"
    }
    STORED_ORDERS.insert(0, order_data)

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            await client.post("http://127.0.0.1:5678/webhook/grocery-order-webhook", json=order_data)
    except Exception:
        pass

    return {"status": "success", "message": "Order placed successfully", "order": order_data}

@app.get("/api/v1/orders/all")
def get_all_orders():
    return {"status": "success", "orders": STORED_ORDERS}
