from .api import api_bp
from .main import main_bp


def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")
