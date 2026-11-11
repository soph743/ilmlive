from functools import wraps

from flask import Blueprint, redirect, render_template, session, url_for

main_bp = Blueprint("main", __name__)


def home_for(role):
    return url_for("main.streamer_home" if role == "streamer" else "main.viewer_home")


def role_required(role):
    """Require a logged-in user with the given role; otherwise redirect."""

    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            if "email" not in session:
                return redirect(url_for("auth.login"))
            if session.get("role") != role:
                return redirect(home_for(session.get("role")))
            return view(*args, **kwargs)

        return wrapped

    return decorator


@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/viewer")
@role_required("viewer")
def viewer_home():
    return render_template("viewer_home.html")


@main_bp.route("/streamer")
@role_required("streamer")
def streamer_home():
    return render_template("streamer_home.html")
