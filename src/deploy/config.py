from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "Airway Assessment API"
    app_version: str = "2.0.0"
    debug: bool = False

    mongo_url: str = "mongodb://localhost:27017"
    mongo_db: str = "airway_db"

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 480

    ollama_url: str = "http://localhost:11434/api/generate"
    llm_model: str = "qvac/medpsy"
    llm_temperature: float = 0.3
    llm_max_tokens: int = 512

    model_checkpoint: str = "checkpoints/tabular_best.pt"
    model_device: str = "cpu"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
