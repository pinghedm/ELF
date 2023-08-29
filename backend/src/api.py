from flask import Blueprint, request, abort, session, make_response
from .models import Person, Event, PersonEvent, EventType, PersonEventType, db
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


@bp.route("/get_person/<token>")
def get_person(token):
    person = Person.query.filter_by(token=token).one_or_404()
    people = db.session.execute(db.select(Person)).scalars().all()
    people_token_by_id = {p.id: p.token for p in people}

    person_events_subquery = (
        db.session.query(PersonEvent.event)
        .filter(Person.id.in_([person.id]))
        .subquery()
    )
    person_events = (
        db.session.execute(
            db.select(PersonEvent).filter(PersonEvent.event.in_(person_events_subquery))
        )
        .scalars()
        .all()
    )

    event_pks = {pe.event for pe in person_events}
    events = (
        db.session.execute(db.select(Event).filter(Event.id.in_(event_pks)))
        .scalars()
        .all()
    )

    serial_events_by_id = {
        e.id: {
            **e.serialize(include_people=False),
            "reported_by": people_token_by_id[e.reported_by],
        }
        for e in events
    }

    for pe in person_events:
        if pe.relation_type == PersonEventType.PRIMARY.value:
            serial_events_by_id[pe.event]["primary_person_token"] = people_token_by_id[
                pe.person
            ]
        elif pe.relation_type == PersonEventType.SECONDARY.value:
            serial_events_by_id[pe.event][
                "secondary_person_token"
            ] = people_token_by_id[pe.person]

    res = person.serialize()
    res["events"] = list(serial_events_by_id.values())
    return res


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
