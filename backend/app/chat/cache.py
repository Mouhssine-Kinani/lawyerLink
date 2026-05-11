#backend/app/chat/cache.py
import json
import time
from sqlalchemy.orm import Session
from app.lawyer.model import Lawyer
from app.user.model import User


CACHE_TTL = 600  # 10 minutes

_specialties_cache: set = set()
_specialties_cache_timestamp: float = 0

_cities_cache: list[str] = []
_cities_cache_timestamp: float = 0


def get_cached_specialties(db: Session) -> set:
    global _specialties_cache, _specialties_cache_timestamp

    if _specialties_cache and (time.time() - _specialties_cache_timestamp) < CACHE_TTL:
        return _specialties_cache

    lawyers = db.query(Lawyer.specialties).filter(Lawyer.is_active == True).all()

    all_specialties = set()
    for (specialties_json,) in lawyers:
        if specialties_json:
            try:
                all_specialties.update(json.loads(specialties_json))
            except (json.JSONDecodeError, TypeError):
                all_specialties.update([s.strip() for s in specialties_json.split(",")])

    if not all_specialties:
        all_specialties = {"general"}

    _specialties_cache = all_specialties
    _specialties_cache_timestamp = time.time()
    return _specialties_cache


def invalidate_specialties_cache():
    global _specialties_cache, _specialties_cache_timestamp
    _specialties_cache = set()
    _specialties_cache_timestamp = 0


def get_cached_cities(db: Session) -> list[str]:
    global _cities_cache, _cities_cache_timestamp

    if _cities_cache and (time.time() - _cities_cache_timestamp) < CACHE_TTL:
        return _cities_cache

    rows = db.query(User.city).filter(
        User.city != None,
        User.city != ""
    ).distinct().all()

    _cities_cache = [row.city.lower().strip() for row in rows if row.city]
    _cities_cache_timestamp = time.time()
    return _cities_cache


def invalidate_cities_cache():
    global _cities_cache, _cities_cache_timestamp
    _cities_cache = []
    _cities_cache_timestamp = 0