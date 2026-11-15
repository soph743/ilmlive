import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"
    # Path to the Firebase service account JSON (Project settings > Service accounts).
    FIREBASE_CREDENTIALS = os.environ.get("FIREBASE_CREDENTIALS")
    # Web API key (Project settings > General), used to verify passwords on login.
    FIREBASE_API_KEY = os.environ.get("FIREBASE_API_KEY")
    # Comma-separated invite codes a new streamer must enter once, at sign-up.
    STREAMER_INVITE_CODES = {
        code.strip().upper()
        for code in os.environ.get("STREAMER_INVITE_CODES", "").split(",")
        if code.strip()
    }
    SESSION_COOKIE_SAMESITE = "Lax"
