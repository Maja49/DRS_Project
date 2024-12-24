#ovdje definisemo nas JWT
import jwt
from datetime import datetime, timedelta, timezone

SECRET_KEY = "a#4h!r3d89D09$2faHf!sd83F@#s"

# Funkcija za generisanje tokena
def generate_token(user_id, is_admin, username, is_approved):
    payload = {
        "user_id": user_id,
        "is_admin": is_admin,
        "username": username,
        "is_approved": is_approved,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)  # Token važi 1 sat
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

# Funkcija za validaciju tokena
def decode_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload  # Ako je validan, vraća podatke iz tokena
    except jwt.ExpiredSignatureError:
        return {"error": "Token expired"}
    except jwt.InvalidTokenError:
        return {"error": "Invalid token"}

