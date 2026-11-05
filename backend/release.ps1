$ErrorActionPreference = "Stop"

if (-not $env:DJANGO_SECRET_KEY -or $env:DJANGO_SECRET_KEY.Length -lt 50) {
    throw "Set DJANGO_SECRET_KEY to the production secret before releasing."
}
if (-not $env:DATABASE_URL) {
    throw "Set DATABASE_URL to the production PostgreSQL migration connection before releasing."
}
if (-not $env:DJANGO_ALLOWED_HOSTS) {
    throw "Set DJANGO_ALLOWED_HOSTS to the deployed hostname before releasing."
}

$env:DJANGO_DEBUG = "false"
python manage.py check --deploy
python manage.py migrate --noinput
python manage.py seed_curriculum
