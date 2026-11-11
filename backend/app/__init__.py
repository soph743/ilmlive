from dotenv import load_dotenv
from flask import Flask

from .config import Config


def create_app(config_class=Config):
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(config_class)

    from .routes import register_blueprints

    register_blueprints(app)

    return app
