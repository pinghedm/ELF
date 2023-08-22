from flask_sqlalchemy import SQLAlchemy
from enum import IntEnum
from sqlalchemy.schema import CheckConstraint, ForeignKey
from flask_login.mixins import UserMixin
from werkzeug.security import generate_password_hash

db = SQLAlchemy()


class Person(db.Model, UserMixin):
    __tablename__ = "person"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, nullable=False)
    password = db.Column(db.String, nullable=True)

    def __repr__(self) -> str:
        return f"{self.name} [{self.id}]"

    def serialize(self):
        return {"name": self.name}

    @staticmethod
    def create(name, password):
        existing_user = Person.query.filter_by(name=name).first()
        if not existing_user:
            new_user = Person(name=name, password=generate_password_hash(password))
            db.session.add(new_user)
            db.session.commit()


class EventType(IntEnum):
    KILL = 1
    ASSIST = 2
    OBSERVE = 3


class Event(db.Model):
    __tablename__ = "event"
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.Integer, index=True, nullable=False)
    reported_by = db.Column(ForeignKey("person.id"), index=True, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "1 <= event_type and event_type <= 3",
            name="check_event_type_valid",
        ),
    )


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
