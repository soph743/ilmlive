from flask import Blueprint, flash, redirect, render_template, request, session, url_for

from .. import firebase
from ..firebase import AuthError
from .main import home_for

auth_bp = Blueprint("auth", __name__)


def _log_in(user):
    session.clear()
    session["uid"] = user["uid"]
    session["email"] = user["email"]
    session["role"] = user["role"]


@auth_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        email = firebase.normalize_email(request.form.get("email"))
        password = request.form.get("password", "")
        role = request.form.get("role")

        error = None
        if not email or "@" not in email:
            error = "Please enter a valid email."
        elif len(password) < firebase.MIN_PASSWORD_LENGTH:
            error = f"Password must be at least {firebase.MIN_PASSWORD_LENGTH} characters."
        elif role not in firebase.ROLES:
            error = "Please choose viewer or streamer."
        else:
            try:
                user = firebase.create_user(email, password, role)
            except AuthError as e:
                error = str(e)
            else:
                _log_in(user)
                return redirect(home_for(user["role"]))

        flash(error)
        return render_template("auth/signup.html", email=email, role=role), 400

    return render_template("auth/signup.html")


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = firebase.normalize_email(request.form.get("email"))
        try:
            user = firebase.authenticate(email, request.form.get("password", ""))
        except AuthError as e:
            flash(str(e))
            return render_template("auth/login.html", email=email), 401
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
