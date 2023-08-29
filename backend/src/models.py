from flask_sqlalchemy import SQLAlchemy
from enum import IntEnum
from sqlalchemy.schema import CheckConstraint, ForeignKey
from flask_login.mixins import UserMixin
from werkzeug.security import generate_password_hash
from .utils import gen_token
from sqlalchemy import MetaData
from sqlalchemy.sql import func


db = SQLAlchemy(
    metadata=MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    )
)


class Person(db.Model, UserMixin):
    __tablename__ = "person"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    password = db.Column(db.String, nullable=True)
    token = db.Column(
        db.String, nullable=False, unique=True, default=lambda: gen_token(prefix="PP")
    )

    def __repr__(self) -> str:
        return f"{self.name} [{self.token}]"

    def serialize(self):
        return {"name": self.name, "token": self.token}

    @staticmethod
    def create_user(name, password):
        existing_user = Person.query.filter_by(name=name).first()
        if not existing_user:
            new_user = Person(name=name, password=generate_password_hash(password))
            db.session.add(new_user)
            db.session.commit()

    @staticmethod
    def create(name):
        new_person = Person(name=name)
        db.session.add(new_person)
        db.session.commit()
        return new_person


class EventType(IntEnum):
    KILL = 1
    ASSIST = 2
    OBSERVE = 3


class Event(db.Model):
    __tablename__ = "event"
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.Integer, index=True, nullable=False)
    reported_by = db.Column(ForeignKey("person.id"), index=True, nullable=False)
    token = db.Column(
        db.String, nullable=False, unique=True, default=lambda: gen_token(prefix="EV")
    )
    created = db.Column(
        db.DateTime, nullable=False, default=func.now(), server_default=func.now()
    )
    location = db.Column(db.String, nullable=True)

    __table_args__ = (
        CheckConstraint(
            "1 <= event_type and event_type <= 3",
            name="check_event_type_valid",
        ),
    )

    @staticmethod
    def create(
        event_type,
        reported_by_token,
        primary_person_token,
        secondary_person_token,
        location,
    ):
        if not EventType(event_type):
            raise TypeError
        if not primary_person_token:
            raise TypeError
        reported_by_person = Person.query.filter_by(token=reported_by_token).first()
        new_event = Event(event_type=event_type, reported_by=reported_by_person.id)
        if location:
            new_event.location = location
        db.session.add(new_event)

        primary_person = Person.query.filter_by(token=primary_person_token).first()
        new_primary_event_through = PersonEvent(
            event=new_event.id,
            person=primary_person.id,
            relation_type=PersonEventType.PRIMARY.value,
        )
        db.session.add(new_primary_event_through)

        if secondary_person_token:
            secondary_person = Person.query.filter_by(
                token=secondary_person_token
            ).first()
            new_secondary_event_through = PersonEvent(
                event=new_event.id,
                person=secondary_person.id,
                relation_type=PersonEventType.SECONDARY.value,
            )
            db.session.add(new_secondary_event_through)

        db.session.commit()


class PersonEventType(IntEnum):
    PRIMARY = 1
    SECONDARY = 2


class PersonEvent(db.Model):
    __tablename__ = "person_event"
    id = db.Column(db.Integer, primary_key=True)
    event = db.Column(ForeignKey("event.id"), index=True, nullable=False)
    person = db.Column(ForeignKey("person.id"), index=True, nullable=False)
    relation_type = db.Column(db.Integer, index=True, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "1 <= relation_type and relation_type <= 2",
            name="check_relation_type_valid",
        ),
    )
