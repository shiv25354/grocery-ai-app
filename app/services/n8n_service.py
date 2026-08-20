"""Asynchronous n8n webhook integration.

The webhook is fired in the background after an order is confirmed. It must
never block or fail customer checkout, so all exceptions are swallowed and
returned as a structured result instead.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def trigger_n8n_order_workflow(order_data: dict[str, Any]) -> dict[str, Any]:
    url = settings.N8N_ORDER_WEBHOOK_URL
    if not url:
        return {"status": "skipped", "reason": "N8N webhook URL not configured"}

    try:
        async with httpx.AsyncClient(timeout=settings.N8N_WEBHOOK_TIMEOUT) as client:
            response = await client.post(url, json=order_data)
            response.raise_for_status()
        return {"status": "success", "http_status": response.status_code}
    except httpx.TimeoutException as exc:
        logger.warning("n8n webhook timed out: %s", exc)
        return {"status": "timeout", "error": str(exc)}
    except httpx.HTTPError as exc:
        logger.warning("n8n webhook request failed: %s", exc)
        return {"status": "failed", "error": str(exc)}
    except Exception as exc:  # noqa: BLE001 - never let webhook break checkout
        logger.exception("unexpected n8n webhook error")
        return {"status": "failed", "error": str(exc)}
