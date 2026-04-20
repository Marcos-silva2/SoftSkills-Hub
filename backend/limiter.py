import os
import time
from slowapi import Limiter
from slowapi.util import get_remote_address


def _key_func(request):
    # Em modo de teste cada requisição tem chave única — rate limit efetivamente desativado
    if os.environ.get("TESTING"):
        return f"test-{time.time_ns()}"
    return get_remote_address(request)


limiter = Limiter(key_func=_key_func)
