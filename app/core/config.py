from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Grocery AI API"
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./grocery_ai.db"

    N8N_ORDER_WEBHOOK_URL: str = "http://127.0.0.1:5678/webhook/grocery-order-webhook"
    N8N_WEBHOOK_TIMEOUT: float = 3.0

    OPENAI_API_KEY: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
