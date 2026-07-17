# syntax=docker/dockerfile:1

FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --no-scripts

COPY . .
RUN composer dump-autoload --no-dev --optimize

FROM php:8.3-apache

ENV PORT=8080
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl libzip-dev unzip; \
    docker-php-ext-install pdo_mysql zip opcache; \
    a2dismod -f mpm_event || true; \
    a2dismod -f mpm_worker || true; \
    rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_event.conf; \
    rm -f /etc/apache2/mods-enabled/mpm_worker.load /etc/apache2/mods-enabled/mpm_worker.conf; \
    a2enmod mpm_prefork rewrite headers; \
    apache2ctl -M 2>/dev/null | grep mpm; \
    rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=vendor /app /var/www/html
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint

RUN chmod +x /usr/local/bin/entrypoint \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" || exit 1

ENTRYPOINT ["entrypoint"]
CMD ["apache2-foreground"]
