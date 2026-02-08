from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # Twilio
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str

    # Gradium
    gradium_api_key: str

    # OpenAI (used in Step 4)
    openai_api_key: str = ""

    # Dust (used in Step 7)
    dust_api_key: str = ""
    dust_workspace_id: str = ""
    dust_agent_id: str = ""
    dust_digest_agent_id: str = ""
    dust_qa_agent_id: str = ""

    # Supabase
    supabase_url: str
    supabase_key: str

    # Server — hostname only, no https:// prefix (interpolated into wss:// URL)
    server_base_url: str

    # Phone numbers
    family_phone: str = ""
    resident_phone: str

    # Auth
    jwt_secret: str = "veille-hackathon-secret-change-me"

    # Demo resident UUID (hardcoded for hackathon)
    resident_id: str = "11111111-1111-1111-1111-111111111111"


settings = Settings()
