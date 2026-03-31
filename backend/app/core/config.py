from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Chama API"
    api_v1_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./app.db"

    jwt_secret: str = "CHANGE_ME"
    jwt_algorithm: str = "HS256"
    access_token_exp_minutes: int = 60 * 24

    cors_origins: str = "*"

    mpesa_consumer_key: str | None = None
    mpesa_consumer_secret: str | None = None
    mpesa_shortcode: str | None = None
    mpesa_passkey: str | None = None
    mpesa_environment: str = "sandbox"  # sandbox|production


settings = Settings()
