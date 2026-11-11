from flask import Blueprint, flash, redirect, render_template, request, session, url_for

from .. import users
from .main import home_for

auth_bp = Blueprint("auth", __name__)


def _log_in(user):
    session.clear()
    session["email"] = user["email"]
    session["role"] = user["role"]


@auth_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        email = users.normalize_email(request.form.get("email"))
        password = request.form.get("password", "")
        role = request.form.get("role")

        error = None
        if not email or "@" not in email:
            error = "Please enter a valid email."
        elif len(password) < 8:
            error = "Password must be at least 8 characters."
        elif role not in users.ROLES:
            error = "Please choose viewer or streamer."
        else:
            user = users.create_user(email, password, role)
            if user is None:
                error = "An account with that email already exists."
            else:
                _log_in(user)
                return redirect(home_for(user["role"]))

        flash(error)
        return render_template("auth/signup.html", email=email, role=role), 400

    return render_template("auth/signup.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = users.normalize_email(request.form.get("email"))
        user = users.authenticate(email, request.form.get("password", ""))
        if user:
            _log_in(user)
            return redirect(home_for(user["role"]))

        flash("Invalid email or password.")
        return render_template("auth/login.html", email=email), 401

    return render_template("auth/login.html")


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return redirect(url_for("auth.login"))
