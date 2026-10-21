#!/bin/sh
set -e

echo "Waiting for database..."
python <<'PY'
import os
import time

host = os.environ.get("POSTGRES_HOST")
if not host:
    raise SystemExit(0)

import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.db import connection

for attempt in range(30):
    try:
        connection.ensure_connection()
        print("Database is ready.")
        break
    except Exception as exc:
        print(f"DB not ready ({attempt + 1}/30): {exc}")
        time.sleep(2)
else:
    raise SystemExit("Database did not become ready in time.")
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "${SEED_ON_START:-true}" = "true" ]; then
  python manage.py seed_word_garden || echo "WARNING: seed_word_garden failed; continuing startup."
  python manage.py expand_vocabulary || echo "WARNING: expand_vocabulary failed; continuing startup."
fi

exec gunicorn config.wsgi:application \
  --bind "0.0.0.0:${PORT:-9000}" \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-60}"
