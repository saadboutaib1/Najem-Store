#!/usr/bin/env sh
set -eu

: "${PORT:=8080}"

a2dismod -f mpm_event || true
a2dismod -f mpm_worker || true
rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf
rm -f /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf
a2enmod mpm_prefork rewrite headers
apache2ctl -M 2>/dev/null | grep mpm

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
