import random
import string


def gen_token(prefix="", len=10):
    return f'{prefix + "_" if prefix else ""}{"".join(random.choices(string.ascii_lowercase, k=len))}'
