"""Rate limiter global da aplicação via slowapi."""

import os
import time

from slowapi import Limiter
from slowapi.util import get_remote_address


def _key_func(request):
    # Em modo de teste cada requisição recebe chave única — rate limit desativado.
    if os.environ.get("TESTING"):
        return f"test-{time.time_ns()}"
    return get_remote_address(request)


limiter = Limiter(key_func=_key_func)
