"""JSON auth API used by the React frontend (/api/auth/...).

The logged-in user is kept in Flask's signed session cookie. Every request
body must be JSON, which also stops plain cross-site form posts.
"""
import re
from functools import wraps

from flask import Blueprint, current_app, jsonify, request, session

from .. import firebase
from ..firebase import AuthError

auth_bp = Blueprint("auth", __name__)

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 80


def _error(message, status=400):
    return jsonify(error=message), status


def _body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _text(data, key):
    value = data.get(key)
    return value.strip() if isinstance(value, str) else ""


def _log_in(user):
    session.clear()
    session["uid"] = user["uid"]
    return jsonify(user=user)


def login_required(view):
    """Pass the current Firebase user to the view, or return 401."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        user = firebase.get_user(session["uid"]) if "uid" in session else None
        if not user:
            session.clear()
            return _error("Please sign in again.", 401)
        return view(user, *args, **kwargs)

    return wrapped


@auth_bp.post("/signup")
def signup():
    data = _body()
    name = _text(data, "name")[:MAX_NAME_LENGTH]
    email = firebase.normalize_email(data.get("email"))
    password = data.get("password") or ""
    role = data.get("role")
    invite_code = _text(data, "inviteCode").upper()

    if len(name) < MIN_NAME_LENGTH:
        return _error("Enter your full name.")
    if not EMAIL_PATTERN.match(email):
        return _error("Enter a valid email address.")
    if len(password) < firebase.MIN_PASSWORD_LENGTH:
        return _error(f"Your password must be at least {firebase.MIN_PASSWORD_LENGTH} characters.")
    if role not in firebase.ROLES:
        return _error("Choose whether you're joining to learn or to teach.")
    # Only new streamers need an invite; viewers can sign up any time.
    if role == "streamer" and invite_code not in current_app.config["STREAMER_INVITE_CODES"]:
        return _error("That invite code is not valid.", 403)

    try:
        user = firebase.create_user(email, password, role, name)
    except AuthError as e:
        return _error(str(e))
    return _log_in(user)


@auth_bp.post("/login")
def login():
    data = _body()
    email = firebase.normalize_email(data.get("email"))
    password = data.get("password") or ""
    if not email or not password:
        return _error("Enter your email and password.")

    try:
        user = firebase.authenticate(email, password)
    except AuthError as e:
        return _error(str(e), 401)
    if not user:
        return _error("We could not sign you in. Check your email and password.", 401)
    return _log_in(user)


@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify(ok=True)


@auth_bp.get("/me")
def me():
    """The signed-in user, or null (not an error, so the app can check on load)."""
    user = firebase.get_user(session["uid"]) if "uid" in session else None
    if not user:
        session.clear()
    return jsonify(user=user)


@auth_bp.patch("/me")
@login_required
def update_me(user):
    name = _text(_body(), "name")[:MAX_NAME_LENGTH]
    if len(name) < MIN_NAME_LENGTH:
        return _error("Your name is required.")
    try:
        user = firebase.update_user(user["uid"], display_name=name)
    except AuthError as e:
        return _error(str(e))
    return jsonify(user=user)


@auth_bp.post("/credentials")
@login_required
def update_credentials(user):
    """Change email and/or password after re-checking the current password."""
    data = _body()
    current_password = data.get("currentPassword") or ""
    new_email = firebase.normalize_email(data.get("newEmail"))
    new_password = data.get("newPassword") or ""

    if not current_password:
        return _error("Enter your current password to make changes.")

    changes = {}
    if new_email and new_email != user["email"]:
        if not EMAIL_PATTERN.match(new_email):
            return _error("Enter a valid email address.")
        changes["email"] = new_email
    if new_password:
        if new_password == current_password:
            return _error("Choose a password different from your current one.")
        changes["password"] = new_password
    if not changes:
        return _error("Enter a new email address or a new password.")

    try:
        if not firebase.authenticate(user["email"], current_password):
            return _error("Your current password is incorrect.", 403)
        user = firebase.update_user(user["uid"], **changes)
    except AuthError as e:
        return _error(str(e))
    return jsonify(user=user)
