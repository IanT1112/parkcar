import asyncio
import json
import os
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str | None
    role: str


def _verify_with_supabase(token: str) -> dict:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    api_key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", "")
    if not url or not api_key:
        raise RuntimeError("Supabase Auth no está configurado en el backend")

    request = UrlRequest(
        f"{url}/auth/v1/user",
        headers={"apikey": api_key, "Authorization": f"Bearer {token}"},
    )
    try:
        with urlopen(request, timeout=5) as response:
            return json.loads(response.read())
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise ValueError("Token inválido o no verificable") from exc


async def require_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> AuthenticatedUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Se requiere autenticación")

    try:
        data = await asyncio.to_thread(_verify_with_supabase, credentials.credentials)
    except RuntimeError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    user_id = data.get("id")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario inválido")
    role = (data.get("app_metadata") or {}).get("role", "usuario")
    return AuthenticatedUser(id=user_id, email=data.get("email"), role=role)


class InMemoryRateLimiter:
    def __init__(self) -> None:
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def check(self, key: str) -> None:
        limit = int(os.environ.get("RATE_LIMIT_REQUESTS", "40"))
        window = int(os.environ.get("RATE_LIMIT_WINDOW_SECONDS", "60"))
        now = time.monotonic()
        async with self._lock:
            timestamps = self._requests[key]
            while timestamps and timestamps[0] <= now - window:
                timestamps.popleft()
            if len(timestamps) >= limit:
                retry_after = max(1, int(window - (now - timestamps[0])))
                raise HTTPException(
                    status.HTTP_429_TOO_MANY_REQUESTS,
                    "Demasiadas solicitudes. Intenta nuevamente más tarde.",
                    headers={"Retry-After": str(retry_after)},
                )
            timestamps.append(now)


rate_limiter = InMemoryRateLimiter()


async def enforce_rate_limit(
    request: Request,
    user: AuthenticatedUser = Depends(require_user),
) -> AuthenticatedUser:
    client_ip = request.client.host if request.client else "unknown"
    await rate_limiter.check(f"{user.id}:{client_ip}")
    return user
