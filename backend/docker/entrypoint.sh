#!/usr/bin/env sh
set -eu

: "${PORT:=8080}"

sed -ri "s/Listen [0-9]+/Listen ${PORT}/" /etc/apache2/ports.conf
sed -ri "s/<VirtualHost \*:[0-9]+>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true

php artisan storage:link >/dev/null 2>&1 || true

if [ "${APP_ENV:-production}" != "local" ]; then
  php artisan config:cache --no-ansi
  php artisan route:cache --no-ansi
  php artisan view:cache --no-ansi
fi

exec "$@"