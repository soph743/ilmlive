import os

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key")
    DEBUG = os.environ.get("FLASK_DEBUG", "0") == "1"
    # Temporary local user store; replaced by Firebase later.
    USERS_FILE = os.environ.get("USERS_FILE", os.path.join(BASE_DIR, "instance", "users.json"))
