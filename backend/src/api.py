from flask import Blueprint, request, abort, session
from .models import Person, Event, PersonEvent, EventType, PersonEventType
from flask_login import login_required, current_user


bp = Blueprint("api", __name__)


@bp.route("/get_all_persons")
@login_required
def get_all_persons():
    people = Person.query.all()
    return {"people": [p.serialize() for p in people]}


@bp.route("/get_all_locations")
@login_required
def get_all_locations():
    names = [t[0] for t in Event.query.with_entities(Event.location).distinct().all()]
    return {"locations": list({n for n in names if n})}


@bp.route("/create_person", methods=["POST"])
@login_required
def create_person():
    post_data = request.json
    person = Person.create(post_data["name"])
    return person.serialize(), 201


@bp.route("/create_event", methods=["POST"])
@login_required
def create_event():
    post_data = request.json
    current_user_token = current_user.token
    quantity = post_data.get("quantity", 1)
    for _ in range(quantity):
        try:
            Event.create(
                post_data["event_type"],
                current_user_token,
                post_data["primary_person_token"],
                post_data.get("secondary_person_token", None),
                post_data.get("location", ""),
            )
        except TypeError:
            continue
            # return "Invalid Event", 400
    return "", 200


@bp.route("/get_leaderboard_data")
@login_required
def get_leaderboard_data():
    to_return = []
    events = Event.query.all()
    person_events = PersonEvent.query.all()
    for person in Person.query.all():
        num_kills = (
            PersonEvent.query.filter_by(
                person=person.id,
                relation_type=PersonEventType.PRIMARY.value,
            )
            .join(Event)
            .filter_by(
                event_type=EventType.KILL.value,
            )
            .count()
        )
        num_assists = (
            PersonEvent.query.filter_by(
                person=person.id,
                relation_type=PersonEventType.SECONDARY.value,
            )
            .join(Event)
            .filter_by(
                event_type=EventType.KILL.value,
            )
            .count()
            + PersonEvent.query.filter_by(
                person=person.id,
                relation_type=PersonEventType.PRIMARY.value,
            )
            .join(Event)
            .filter_by(
                event_type=EventType.ASSIST.value,
            )
            .count()
        )
        num_observes = (
            PersonEvent.query.filter_by(
                person=person.id,
                relation_type=PersonEventType.PRIMARY.value,
            )
            .join(Event)
            .filter_by(
                event_type=EventType.OBSERVE.value,
            )
        ).count()
        obj = {
            "person": person.serialize(),
            "kills": num_kills,
            "assists": num_assists,
            "observes": num_observes,
        }
        to_return.append(obj)
    return to_return
