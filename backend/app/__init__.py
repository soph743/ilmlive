from dotenv import load_dotenv
from flask import Flask

# Load .env before importing config, which reads os.environ at import time.
load_dotenv()

from .config import Config  # noqa: E402


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    from . import firebase

    firebase.init_app(app)

    from .routes import register_blueprints

    register_blueprints(app)

    return app
