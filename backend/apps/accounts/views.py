import json
from functools import wraps
from datetime import timedelta
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.core.exceptions import ValidationError
from django.db import transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.core.validators import validate_email
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

def _body(request):
    try:
        return json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None

def _account_response(user):
    profile = user.profile
    today = timezone.localdate()
    start = today - timedelta(days=6)
    daily = {row["day"].isoformat(): row["total"] for row in user.xp_transactions.filter(created_at__date__gte=start).annotate(day=TruncDate("created_at")).values("day").annotate(total=Sum("amount"))}
    weekly_activity = [{"date": (start + timedelta(days=index)).isoformat(), "label": (start + timedelta(days=index)).strftime("%a"), "xp": daily.get((start + timedelta(days=index)).isoformat(), 0)} for index in range(7)]
    return JsonResponse({"authenticated": True, "user": {"id": user.id, "username": user.username, "email": user.email, "isStaff": user.is_staff}, "profile": {"totalXp": profile.total_xp, "streakDays": profile.streak_days, "longestStreak": profile.longest_streak, "weeklyActivity": weekly_activity}})

def auth_rate_limit(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        remote = request.META.get("REMOTE_ADDR", "unknown")
        key = f"auth-attempts:{view.__name__}:{remote}"
        attempts = cache.get(key, 0)
        if attempts >= 10:
            return JsonResponse({"detail": "Too many attempts. Try again in 15 minutes."}, status=429)
        if attempts == 0:
            cache.set(key, 1, timeout=900)
        else:
            cache.incr(key)
        return view(request, *args, **kwargs)
    return wrapped

@ensure_csrf_cookie
@require_GET
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})

@require_GET
def me(request):
    if not request.user.is_authenticated:
        return JsonResponse({"authenticated": False})
    return _account_response(request.user)

@require_POST
@auth_rate_limit
def register(request):
    data = _body(request)
    if data is None:
        return JsonResponse({"detail": "Send valid JSON."}, status=400)
    username = str(data.get("username", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    if len(username) < 3 or len(username) > 30:
        return JsonResponse({"detail": "Username must be 3 to 30 characters."}, status=400)
    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse({"detail": "That username is already taken."}, status=400)
    if not email or User.objects.filter(email__iexact=email).exists():
        return JsonResponse({"detail": "Enter an email address that is not already registered."}, status=400)
    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({"detail": "Enter a valid email address."}, status=400)
    try:
        validate_password(password)
    except ValidationError as exc:
        return JsonResponse({"detail": " ".join(exc.messages)}, status=400)
    with transaction.atomic():
        user = User.objects.create_user(username=username, email=email, password=password)
    login(request, user)
    return _account_response(user)

@require_POST
@auth_rate_limit
def sign_in(request):
    data = _body(request)
    if data is None:
        return JsonResponse({"detail": "Send valid JSON."}, status=400)
    user = authenticate(request, username=str(data.get("username", "")).strip(), password=data.get("password", ""))
    if user is None:
        return JsonResponse({"detail": "Username or password is incorrect."}, status=400)
    login(request, user)
    return _account_response(user)

@require_POST
def sign_out(request):
    logout(request)
    return JsonResponse({"authenticated": False})
