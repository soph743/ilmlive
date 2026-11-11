"""User accounts backed by Firebase Authentication.

Firebase stores the accounts and hashes/validates passwords. The Admin SDK
creates users and stores each user's role as a custom claim; logging in goes
through the Firebase Auth REST API, since the Admin SDK can't check passwords.
"""
import firebase_admin
import requests
from firebase_admin import auth, credentials
from flask import current_app

ROLES = ("viewer", "streamer")

# Firebase's default minimum password length.
MIN_PASSWORD_LENGTH = 6

SIGN_IN_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword"

# Sign-in error codes that just mean "wrong email or password".
BAD_CREDENTIALS = (
    "EMAIL_NOT_FOUND",
    "INVALID_PASSWORD",
    "INVALID_LOGIN_CREDENTIALS",
    "INVALID_EMAIL",
    "MISSING_PASSWORD",
)


class AuthError(Exception):
    """A user-facing authentication error."""


def init_app(app):
    if firebase_admin._apps:
        return
    cred_path = app.config["FIREBASE_CREDENTIALS"]
    if not cred_path or not app.config["FIREBASE_API_KEY"]:
        raise RuntimeError(
            "Firebase is not configured. Set FIREBASE_CREDENTIALS and FIREBASE_API_KEY in backend/.env."
        )
    firebase_admin.initialize_app(credentials.Certificate(cred_path))


def normalize_email(email):
    return (email or "").strip().lower()


def _user_dict(record):
    return {
        "uid": record.uid,
        "email": record.email,
        "role": (record.custom_claims or {}).get("role"),
    }


def create_user(email, password, role):
    """Create a Firebase user with the given role. Raises AuthError on failure."""
    if len(password) < MIN_PASSWORD_LENGTH:
        raise AuthError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
    try:
        record = auth.create_user(email=email, password=password)
    except auth.EmailAlreadyExistsError:
        raise AuthError("An account with that email already exists.")
    except ValueError as e:
        raise AuthError(str(e))

    try:
        auth.set_custom_user_claims(record.uid, {"role": role})
    except Exception:
        auth.delete_user(record.uid)
        raise
    return {"uid": record.uid, "email": record.email, "role": role}


def authenticate(email, password):
    """Return the user if the credentials are valid, otherwise None."""
    resp = requests.post(
        SIGN_IN_URL,
        params={"key": current_app.config["FIREBASE_API_KEY"]},
        json={"email": email, "password": password, "returnSecureToken": True},
        timeout=10,
    )
    if resp.status_code != 200:
        message = resp.json().get("error", {}).get("message", "")
        if message.startswith(BAD_CREDENTIALS):
            return None
        if message.startswith("TOO_MANY_ATTEMPTS_TRY_LATER"):
            raise AuthError("Too many failed attempts. Please try again later.")
        if message.startswith("USER_DISABLED"):
            raise AuthError("This account has been disabled.")
        # Anything else (e.g. a bad API key) is a server problem, not the user's.
        current_app.logger.error("Firebase sign-in failed: %s", resp.text)
        raise AuthError("Login is unavailable right now. Please try again later.")
    return _user_dict(auth.get_user(resp.json()["localId"]))
