from flask import Blueprint, request, abort, make_response, current_app, session, g
from .models import Person
from .app import csrf
from werkzeug.security import check_password_hash
from flask_login import login_user, login_required, current_user, logout_user


bp = Blueprint("auth", __name__)


@bp.route("/login", methods=["POST"])
@csrf.exempt
def login():
    post_data = request.json

    name = post_data.get("name")
    password = post_data.get("password")

    person = Person.query.filter_by(name=name).first()
    if person:
        password_is_good = check_password_hash(person.password, password)
        if password_is_good:
            login_user(person, remember=True)
            return ""
    abort(403)


@bp.route("/get_current_user")
@login_required
def get_current_user():
    return current_user.serialize()


@bp.route("/logout")
def logout():
    logout_user()
    return ""


@bp.route("/get_csrf")
@csrf.exempt
@csrf.set_cookie
def get_csrf():
    return ""
