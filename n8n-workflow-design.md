# n8n Automation Workflow: Grocery E-Commerce Order Processing

## Workflow Overview
**Trigger:** FastAPI POST `/api/v1/voice/process-voice` webhook
**Path:** Webhook → Supabase Lookup → Switch (Free Delivery Threshold) → WhatsApp/SMS → Inventory Alert

---

## Node 1: Webhook Node

### Configuration
- **Type:** HTTP Trigger (Webhook)
- **Method:** POST
- **Path:** `order-placed`  (full URL: `https://your-n8n-instance.com/webhook/order-placed`)
- **Authentication:** None (or Header Auth with Bearer token)
- **Response Mode:** Respond Immediately
- **Response Data:** `{{ $json }}` (returns parsed webhook payload)

### Expected Input Payload (from FastAPI)
```json
{
  "order_id": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "items": [
    {
      "item_name": "basmati rice",
      "quantity": 1,
      "unit": "packet",
      "price": 120.00
    },
    {
      "item_name": "dal",
      "quantity": 1.5,
      "unit": "kg",
      "price": 150.00
    }
  ],
  "total_price": 270.00,
  "status": "confirmed"
}
```

**Webhook Node JSON Configuration (exportable):**
```json
{
  "name": "Webhook: Order Placed",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1,
  "position": [250, 300],
  "parameters": {
    "httpMethod": "POST",
    "path": "order-placed",
    "responseMode": "onReceived",
    "responseBody": "={{ $json }}",
    "responseHeaders": [
      {
        "name": "Content-Type",
        "value": "application/json"
      }
    ]
  },
  "credentials": {
    "httpBasicAuth": {
      "id": "",
      "name": ""
    }
  }
}
```

---

## Node 2: Supabase Node - Fetch User & Order Summary

### Configuration
- **Type:** Supabase
- **Operation:** Execute Query
- **Connection:** Your Supabase project credentials
- **Query Type:** SQL
- **SQL Query:**
```sql
SELECT 
  u.id AS user_id,
  u.phone,
  u.full_name,
  u.email,
  o.id AS order_id,
  o.total_price,
  o.status AS order_status,
  json_agg(
    json_build_object(
      'item_name', p.name,
      'quantity', ci.quantity,
      'unit', p.unit,
      'price_at_time', oi.price_at_time
    )
  ) AS items
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN cart_items ci ON ci.user_id = u.id
JOIN products p ON p.id = ci.product_id
JOIN order_items oi ON oi.product_id = p.id AND oi.order_id = o.id
WHERE o.id = $1  -- order_id from webhook
GROUP BY u.id, o.id;
```
- **Parameters:** `$1` = `{{ $json["order_id"] }}` (from previous node)

### Output Data (passes to next node)
```json
{
  "user_id": "...",
  "phone": "+91-98765-43210",
  "full_name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "order_id": "...",
  "total_price": 270.00,
  "items": [
    {
      "item_name": "basmati rice",
      "quantity": 1,
      "unit": "packet",
      "price_at_time": 120.00
    },
    {
      "item_name": "dal", 
      "quantity": 1.5,
      "unit": "kg",
      "price_at_time": 150.00
    }
  ]
}
```

**Supabase Node JSON Configuration:**
```json
{
  "name": "Supabase: Fetch User & Order",
  "type": "n8n-nodes-base.supabase",
  "typeVersion": 1,
  "position": [500, 300],
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT \\n  u.id AS user_id,\\n  u.phone,\\n  u.full_name,\\n  u.email,\\n  o.id AS order_id,\\n  o.total_price,\\n  o.status AS order_status,\\n  json_agg(\\n    json_build_object(\\n      'item_name', p.name,\\n      'quantity', ci.quantity,\\n      'unit', p.unit,\\n      'price_at_time', oi.price_at_time\\n    )\\n  ) AS items\\nFROM orders o\\nJOIN users u ON o.user_id = u.id\\nJOIN cart_items ci ON ci.user_id = u.id\\nJOIN products p ON p.id = ci.product_id\\nJOIN order_items oi ON oi.product_id = p.id AND oi.order_id = o.id\\nWHERE o.id = $1\\nGROUP BY u.id, o.id;",
    "queryParams": [
      {
        "name": "order_id",
        "value": "={{ $json[\"order_id\"] }}",
        "type": "string"
      }
    ]
  },
  "credentials": {
    "supabase": "your-supabase-connection-name"
  }
}
```

---

## Node 3: Switch / IF Node - Free Delivery Threshold

### Configuration
- **Type:** Switch
- **Condition Type:** Expression
- **Expression:** `{{ $json["total_price"] > 500 }}`
- **Output Columns:** Keep all columns from previous node

### Cases
| Case Name | Expression | Description |
|-----------|------------|-------------|
| `free_delivery` | `{{ $json["total_price"] > 500 }}` | Total > ₹500 → free delivery tag |
| `paid_delivery` | `{{ $json["total_price"] <= 500 }}` | Total ≤ ₹500 → delivery charge applies |

**Switch Node JSON Configuration:**
```json
{
  "name": "Switch: Free Delivery Check",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 1,
  "position": [750, 300],
  "parameters": {
    "value": "total_price",
    "conditions": {
      "boolean": [
        {
          "value1": "={{ $json[\"total_price\"] }}",
          "operation": "greaterThan",
          "value2": 500,
          "case": "free_delivery"
        },
        {
          "value1": "={{ $json[\"total_price\"] }}",
          "operation": "lessThanOrEqualTo",
          "value2": 500,
          "case": "paid_delivery"
        }
      ]
    }
  }
}
```

---

## Node 4a: WhatsApp/SMS Node - Free Delivery Path

### Configuration
- **Type:** WhatsApp (or SMS)
- **Connection:** Your WhatsApp Business API or SMS provider
- **Recipient:** `{{ $json["phone"] }}`
- **Message Template (Localized Hindi/English Hinglish):**

#### For Free Delivery (total > ₹500):
```
Hinglish: "Namaste {{ $json["full_name"] }}! Aapka order #{{ $json["order_id"] }} confirm hai. Free delivery! 10 min mein delivery. Thank you!"
Hindi: "नमस्ते {{ $json["full_name"] }}! आपका आर्डर #{{ $json["order_id"] }} कन्फर्म है। फ्री डिलीवरी! 10 मिनट में डिलीवरी। धन्यवाद!"
English: "Hello {{ $json["full_name"] }}! Your order #{{ $json["order_id"] }} is confirmed. Free delivery! arriving in 10 minutes. Thank you!"
```

#### For Paid Delivery (total ≤ ₹500):
```
Hinglish: "Namaste {{ $json["full_name"] }}! Aapka order #{{ $json["order_id"] }} confirm hai. Delivery charges apply. 10 min mein delivery. Thank you!"
Hindi: "नमस्ते {{ $json["full_name"] }}! आपका आर्डर #{{ $json["order_id"] }} कन्फर्म है। डिलीवरी charges apply। 10 मिनट में डिलीवरी। धन्यवाद!"
English: "Hello {{ $json["full_name"] }}! Your order #{{ $json["order_id"] }} is confirmed. Delivery charges apply. arriving in 10 minutes. Thank you!"
```

**WhatsApp Node JSON Configuration (Free Delivery case):**
```json
{
  "name": "WhatsApp: Free Delivery Confirmation",
  "type": "n8n-nodes-base.whatsapp",
  "typeVersion": 1,
  "position": [1000, 200],
  "parameters": {
    "recipient": "={{ $json[\"phone\"] }}",
    "message": "Hinglish: \"Namaste {{ $json[\"full_name"] }}! Aapka order #{{ $json[\"order_id"] }} confirm hai. Free delivery! 10 min mein delivery. Thank you!\""
  },
  "credentials": {
    "whatsapp": "your-whatsapp-connection"
  }
}
```

**WhatsApp Node JSON Configuration (Paid Delivery case):**
```json
{
  "name": "WhatsApp: Paid Delivery Confirmation",
  "type": "n8n-nodes-base.whatsapp",
  "typeVersion": 1,
  "position": [1000, 200],
  "parameters": {
    "recipient": "={{ $json[\"phone\"] }}",
    "message": "Hinglish: \"Namaste {{ $json[\"full_name"] }}! Aapka order #{{ $json[\"order_id"] }} confirm hai. Delivery charges apply. 10 min mein delivery. Thank you!\""
  },
  "credentials": {
    "whatsapp": "your-whatsapp-connection"
  }
}
```

---

## Node 4b: SMS Node Alternative (Twilio)

### Configuration
- **Type:** Twilio SMS
- **From:** Your Twilio virtual number
- **To:** `{{ $json["phone"] }}`
- **Body:** Same localized template as WhatsApp node above

**SMS Node JSON Configuration:**
```json
{
  "name": "SMS: Order Confirmation",
  "type": "n8n-nodes-base.twilio",
  "typeVersion": 1,
  "position": [1000, 400],
  "parameters": {
    "to": "={{ $json[\"phone\"] }}",
    "body": "Hinglish: \"Namaste {{ $json[\"full_name"] }}! Aapka order #{{ $json[\"order_id"] }} confirm hai. Delivery charges apply. 10 min mein delivery. Thank you!\""
  },
  "credentials": {
    "twilio": "your-twilio-connection"
  }
}
```

---

## Node 5: Inventory Alert Node - Stock Monitoring

### Configuration
- **Type:** Supabase (Execute Query)
- **Operation:** Execute Query
- **Connection:** Supabase credentials
- **SQL Query:** Check low-stock items from ordered products
```sql
SELECT 
  p.id,
  p.name,
  p.stock,
  p.unit,
  oi.quantity AS ordered_quantity
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.id = $1  -- order_id from webhook
  AND (p.stock - oi.quantity) < 5;
```
- **Parameters:** `$1` = `{{ $json["order_id"] }}`

### Follow-up: Slack/Telegram Node
If the query returns results (low-stock items), trigger Slack/Telegram notification.

#### Slack Node Configuration
- **Type:** Slack
- **Operation:** Send Message
- **Channel:** `#grocery-alerts` or store manager DM
- **Message:**
```
*:alert: Low Stock Alert*

Order #{{ $json["order_id"] }} items affecting stock:

1. {{ $json["items"][0]["item_name"] }} - Stock will be: {{ $json["items"][0]["stock"] - $json["items"][0]["ordered_quantity"] }} {{ $json["items"][0]["unit"] }}
2. {{ $json["items"][1]["item_name"] }} - Stock will be: {{ $json["items"][1]["stock"] - $json["items"][1]["ordered_quantity"] }} {{ $json["items"][1]["unit"] }}

Please restock immediately.
```

#### Telegram Node Configuration
- **Type:** Telegram Bot
- **Operation:** Send Message
- **Chat ID:** Store manager's chat ID
- **Message:** Same as Slack message above

**Low-Stock Supabase Node JSON Configuration:**
```json
{
  "name": "Supabase: Check Low Stock",
  "type": "n8n-nodes-base.supabase",
  "typeVersion": 1,
  "position": [750, 500],
  "parameters": {
    "operation": "executeQuery",
    "query": "SELECT \\n  p.id,\\n  p.name,\\n  p.stock,\\n  p.unit,\\n  oi.quantity AS ordered_quantity\\nFROM order_items oi\\nJOIN products p ON p.id = oi.product_id\\nJOIN orders o ON o.id = oi.order_id\\nWHERE o.id = $1\\n  AND (p.stock - oi.quantity) < 5;",
    "queryParams": [
      {
        "name": "order_id",
        "value": "={{ $json[\"order_id\"] }}",
        "type": "string"
      }
    ]
  },
  "credentials": {
    "supabase": "your-supabase-connection-name"
  }
}
```

---

## Complete Workflow JSON (Export Format)

```json
{
  "name": "Grocery Order Processing",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "order-placed",
        "responseMode": "onReceived",
        "responseBody": "={{ $json }}"
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "name": "Webhook: Order Placed"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \\n  u.id AS user_id,\\n  u.phone,\\n  u.full_name,\\n  u.email,\\n  o.id AS order_id,\\n  o.total_price,\\n  o.status AS order_status,\\n  json_agg(\\n    json_build_object(\\n      'item_name', p.name,\\n      'quantity', ci.quantity,\\n      'unit', p.unit,\\n      'price_at_time', oi.price_at_time\\n    )\\n  ) AS items\\nFROM orders o\\nJOIN users u ON o.user_id = u.id\\nJOIN cart_items ci ON ci.user_id = u.id\\nJOIN products p ON p.id = ci.product_id\\nJOIN order_items oi ON oi.product_id = p.id AND oi.order_id = o.id\\nWHERE o.id = $1\\nGROUP BY u.id, o.id;",
        "queryParams": [
          {
            "name": "order_id",
            "value": "={{ $json[\"order_id\"] }}",
            "type": "string"
          }
        ]
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [500, 300],
      "name": "Supabase: Fetch User & Order"
    },
    {
      "parameters": {
        "value": "total_price",
        "conditions": {
          "boolean": [
            {
              "value1": "={{ $json[\"total_price\"] }}",
              "operation": "greaterThan",
              "value2": 500,
              "case": "free_delivery"
            },
            {
              "value1": "={{ $json[\"total_price\"] }}",
              "operation": "lessThanOrEqualTo",
              "value2": 500,
              "case": "paid_delivery"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [750, 300],
      "name": "Switch: Free Delivery Check"
    },
    {
      "parameters": {
        "recipient": "={{ $json[\"phone\"] }}",
        "message": "Hinglish: \"Namaste {{ $json[\"full_name"] }}! Aapka order #{{ $json[\"order_id"] }} confirm hai. Free delivery! 10 min mein delivery. Thank you!\""
      },
      "type": "n8n-nodes-base.whatsapp",
      "typeVersion": 1,
      "position": [1000, 200],
      "name": "WhatsApp: Free Delivery Confirmation"
    },
    {
      "parameters": {
        "recipient": "={{ $json[\"phone\"] }}",
        "message": "Hinglish: \"Namaste {{ $json[\"full_name"] }}! Aapka order #{{ $json[\"order_id"] }} confirm hai. Delivery charges apply. 10 min mein delivery. Thank you!\""
      },
      "type": "n8n-nodes-base.whatsapp",
      "typeVersion": 1,
      "position": [1000, 200],
      "name": "WhatsApp: Paid Delivery Confirmation"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT \\n  p.id,\\n  p.name,\\n  p.stock,\\n  p.unit,\\n  oi.quantity AS ordered_quantity\\nFROM order_items oi\\nJOIN products p ON p.id = oi.product_id\\nJOIN orders o ON o.id = oi.order_id\\nWHERE o.id = $1\\n  AND (p.stock - oi.quantity) < 5;",
        "queryParams": [
          {
            "name": "order_id",
            "value": "={{ $json[\"order_id\"] }}",
            "type": "string"
          }
        ]
      },
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [750, 500],
      "name": "Supabase: Check Low Stock"
    }
  ],
  "connections": {
    "Webhook: Order Placed": {
      "main": [
        [
          {
            "node": "Supabase: Fetch User & Order",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Supabase: Fetch User & Order": {
      "main": [
        [
          {
            "node": "Switch: Free Delivery Check",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Switch: Free Delivery Check": {
      "main": [
        [
          {
            "node": "WhatsApp: Free Delivery Confirmation",
            "type": "main",
            "index": "free_delivery"
          }
        ],
        [
          {
            "node": "WhatsApp: Paid Delivery Confirmation",
            "type": "main",
            "index": "paid_delivery"
          }
        ]
      ]
    },
    "Supabase: Check Low Stock": {
      "main": [
        [
          {
            "node": "Slack: Low Stock Alert",
            "type": "main",
            "index": 0
          },
          {
            "node": "Telegram: Low Stock Alert",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": false,
  "settings": {
    "executionOrder": "v2"
  }
}
```

## Key Implementation Notes

1. **Webhook Security:** Validate the webhook signature from FastAPI before processing
2. **Localization:** Message templates support Hindi, Hinglish, and English - detect user language from profile
3. **10-Minute Estimate:** Hardcoded in message templates; could be dynamic based on delivery zone
4. **Free Delivery Threshold:** ₹500 as per requirement; configurable via n8n variable or environment setting
5. **Inventory Alert:** Only triggers when `(stock - ordered_quantity) < 5`; prevents double-notification for same item
6. **Error Handling:** Add "Error Trigger" nodes after each critical step for failed Supabase queries or SMS delivery failures
7. **Idempotency:** Use `order_id` as unique identifier to prevent duplicate order processing