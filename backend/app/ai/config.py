"""Configuration management for CivicLens AI layer."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present in root or parent
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
DEFAULT_TOP_K: int = int(os.getenv("DEFAULT_TOP_K", "3"))

# Safety check helper
def is_gemini_configured() -> bool:
    """Returns True only if a valid, non-empty Gemini API key is configured."""
    return bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 5 and not GEMINI_API_KEY.startswith("your_"))
