# Backend Architecture

FastAPI backend for the Hinglish Voice Commerce application. It parses
Hinglish/English voice commands, manages a local SQLite catalog/order store, and
hands confirmed orders to n8n for downstream automation (WhatsApp/SMS alerts,
inventory monitoring) without blocking customer checkout.

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Framework  | FastAPI (Uvicorn ASGI server)       |
| Validation | Pydantic v2                         |
| Database   | SQLite + SQLAlchemy 2.0 (ORM)       |
| HTTP       | httpx (async)                       |
| Config     | pydantic-settings + `.env`          |

## Server

- Host: `127.0.0.1`
- Port: `8000`
- CORS: enabled for **all origins** (`allow_origins=["*"]`), specifically to
  support the Next.js frontend on `localhost:3000`.

## Project Layout

```
app/
├── main.py                  # App factory, CORS, exception handlers, table bootstrap
├── core/
│   ├── config.py            # Settings (env-driven)
│   └── database.py          # SQLAlchemy engine, SessionLocal, Base, get_db
├── models/
│   ├── user.py              # User
│   ├── product.py           # Product
│   ├── order.py             # Order, OrderItem
│   └── __init__.py
├── schemas/
│   ├── voice.py             # VoiceRequest, VoiceCartItem, ProcessVoiceResponse
│   ├── order.py             # CheckoutRequest/Response, OrderItem*, OrderResponse
│   ├── product.py           # ProductCreate, ProductResponse
│   └── __init__.py
├── services/
│   ├── voice_parser.py      # Hinglish/English transcript -> items + reply
│   ├── n8n_service.py       # Async n8n webhook trigger (non-blocking)
│   └── __init__.py
└── api/
    └── v1/
        ├── router.py        # Aggregates endpoint routers under /api/v1
        └── endpoints/
            ├── voice.py     # POST /voice/process-voice
            ├── orders.py    # POST /orders/checkout
            └── products.py  # GET/POST /products
```

## API Routes

### `GET /`

Health check.

```json
{ "status": "success" }
```

### `POST /api/v1/voice/process-voice`

Accepts a voice transcript, parses the Hinglish/English command, and returns the
extracted items plus a user-friendly Hinglish confirmation.

**Request**

```json
{ "transcript": "2 kilo aaloo aur 1 packet doodh" }
```

**Response**

```json
{
  "status": "success",
  "transcript": "2 kilo aaloo aur 1 packet doodh",
  "extracted_items": [
    { "item_name": "Aaloo", "quantity": 2.0, "unit": "kg" },
    { "item_name": "Doodh", "quantity": 1.0, "unit": "packet" }
  ],
  "reply": "Aapke cart me 2 kg Aaloo aur 1 packet Doodh add kar diye gaye hain."
}
```

Parsing rules (deterministic, no LLM required):

- Numeric literals (`2`, `1.5`, `½`, `¼`) always win.
- Number words (`ek`, `do`, `teen`, `aadha`, `paav`, `dedh`, `dhai`, `dozen`,
  and English equivalents) count only when they lead the phrase or precede a
  unit, so `"aaloo de do"` is read as "give" (quantity 1), not "two".
- Units mapped: `kilo/killoo/kg → kg`, `gram/gm/g → g`, `litre/liter/l → litre`,
  `packet/pkt/pack → packet`, `piece/pc → piece`, `dozen`, `bottle`, `can`, `ml`.
- Multiple items are split on `aur` / `and`.

### `POST /api/v1/orders/checkout`

Validates the order, persists a confirmed `Order` + `OrderItem` records, and
asynchronously fires the n8n webhook.

**Request**

```json
{
  "user_id": "customer_01",
  "items": [
    {
      "product_id": "p1",
      "product_name": "Fresh Potato (Aloo)",
      "quantity": 2,
      "unit": "kg",
      "unit_price": 30.0
    }
  ],
  "total_amount": 60.0,
  "delivery_address": "Flat 402, Green Park, New Delhi",
  "phone_number": "+919876543210"
}
```

**Response**

```json
{
  "status": "success",
  "message": "Order placed successfully",
  "order": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "customer_01",
    "total_amount": 60.0,
    "delivery_address": "Flat 402, Green Park, New Delhi",
    "phone_number": "+919876543210",
    "status": "confirmed",
    "items": [
      {
        "id": "abc...",
        "order_id": "123e4567-...",
        "product_id": "p1",
        "product_name": "Fresh Potato (Aloo)",
        "quantity": 2,
        "unit": "kg",
        "unit_price": 30.0
      }
    ]
  }
}
```

### `GET /api/v1/products/` · `POST /api/v1/products/`

Catalog listing and creation for the local store.

## Database Schema

SQLite file `grocery_ai.db` (created automatically on startup). All primary keys
are UUID strings.

### `users`

| Column        | Type        | Notes                    |
| ------------- | ----------- | ------------------------ |
| id            | String (PK) | UUID                     |
| full_name     | String      | required                 |
| phone_number  | String      | required, unique         |
| email         | String      | nullable                 |
| created_at    | DateTime    | server default `now()`   |

### `products`

| Column       | Type        | Notes                  |
| ------------ | ----------- | ---------------------- |
| id           | String (PK) | UUID                   |
| name         | String      | required               |
| description  | String      | nullable               |
| price        | Float       | required               |
| unit         | String      | default `kg`           |
| stock        | Integer     | default `0`            |
| is_available | Boolean     | default `true`         |

### `orders`

| Column           | Type        | Notes                          |
| ---------------- | ----------- | ------------------------------ |
| id               | String (PK) | UUID                           |
| user_id          | String      | required, indexed              |
| total_amount     | Float       | required                       |
| delivery_address | String      | required                       |
| phone_number     | String      | required                       |
| status           | String      | default `confirmed`            |
| created_at       | DateTime    | server default `now()`         |

### `order_items`

| Column       | Type        | Notes                  |
| ------------ | ----------- | ---------------------- |
| id           | String (PK) | UUID                   |
| order_id     | String      | required, indexed      |
| product_id   | String      | nullable               |
| product_name | String      | required               |
| quantity     | Float       | required (> 0)         |
| unit         | String      | required               |
| unit_price   | Float       | required (>= 0)        |

## n8n Webhook Integration

- URL: `http://127.0.0.1:5678/webhook/grocery-order-webhook`
  (overridable via `N8N_ORDER_WEBHOOK_URL`).
- Timeout: `3` seconds (`N8N_WEBHOOK_TIMEOUT`).
- Triggered via FastAPI `BackgroundTasks` **after** the order is committed, so a
  slow or unreachable n8n instance never blocks or fails checkout. All webhook
  exceptions are caught and logged.

Payload sent to n8n:

```json
{
  "order_id": "123e4567-...",
  "user_id": "customer_01",
  "phone_number": "+919876543210",
  "delivery_address": "Flat 402, Green Park, New Delhi",
  "total_amount": 60.0,
  "status": "confirmed",
  "items": [
    { "item_name": "Fresh Potato (Aloo)", "quantity": 2, "unit": "kg", "price": 30.0 }
  ]
}
```

## Error Handling

| Scenario                 | Status | Body                                        |
| ------------------------ | ------ | ------------------------------------------- |
| Invalid/empty input      | 400    | `{ "status": "error", "detail": [...] }`   |
| Internal error           | 500    | `{ "status": "error", "detail": "..." }`   |

## Configuration (`.env`)

| Key                       | Default                                              |
| ------------------------- | ---------------------------------------------------- |
| `DATABASE_URL`            | `sqlite:///./grocery_ai.db`                          |
| `N8N_ORDER_WEBHOOK_URL`   | `http://127.0.0.1:5678/webhook/grocery-order-webhook`|
| `N8N_WEBHOOK_TIMEOUT`     | `3.0`                                                |
| `OPENAI_API_KEY`          | *(optional, unused by required routes)*              |

## Running

```bash
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
