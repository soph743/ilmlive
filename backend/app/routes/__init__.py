from .api import api_bp
from .auth import auth_bp


def register_blueprints(app):
    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
