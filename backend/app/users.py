"""Temporary local user store backed by a JSON file.

Placeholder until Firebase Auth/Firestore is wired up. Passwords are stored
as salted hashes, never in plain text.
"""
import json
import os
import threading

from flask import current_app
from werkzeug.security import check_password_hash, generate_password_hash

ROLES = ("viewer", "streamer")

_lock = threading.Lock()


def _path():
    return current_app.config["USERS_FILE"]


def _load():
    try:
        with open(_path()) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def _save(users):
    path = _path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp = f"{path}.tmp"
    with open(tmp, "w") as f:
        json.dump(users, f, indent=2)
    os.replace(tmp, path)


def normalize_email(email):
    return (email or "").strip().lower()


def get_user(email):
    return _load().get(normalize_email(email))


def create_user(email, password, role):
    """Create a user. Returns the user dict, or None if the email is taken."""
    email = normalize_email(email)
    with _lock:
        users = _load()
        if email in users:
            return None
        users[email] = {
            "email": email,
            "password_hash": generate_password_hash(password),
            "role": role,
        }
        _save(users)
        return users[email]


def authenticate(email, password):
    """Return the user if the credentials are valid, otherwise None."""
    user = get_user(email)
    if user and check_password_hash(user["password_hash"], password):
        return user
    return None
