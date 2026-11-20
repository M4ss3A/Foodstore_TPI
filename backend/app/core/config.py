""" Configuración centralizada con pydantic-settings. Los valores se leen del archivo .env. """

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Conexion a la base
    DATABASE_URL: str

    # JWT: la clave es obligatoria y debe tener al menos 32 caracteres
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Origen del frontend permitido en CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

# Instancia unica
settings = Settings()