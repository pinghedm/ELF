from .models import Person


def load_user(user_ident_str):
    matching_user = Person.query.filter_by(id=int(user_ident_str)).first()
    return matching_user
