# FROM php:8.2-fpm

# # Install system dependencies and PHP extensions
# RUN apt-get update && apt-get install -y \
#     libpng-dev \
#     libjpeg-dev \
#     supervisor \
#     libfreetype6-dev \
#     libzip-dev \
#     unzip \
#     git \
#     && docker-php-ext-configure gd --with-freetype --with-jpeg \
#     && docker-php-ext-install gd zip pdo pdo_mysql

# # Change PHP-FPM to listen on TCP port 9000
# RUN sed -i 's|^listen = .*|listen = 0.0.0.0:9000|' /usr/local/etc/php-fpm.d/www.conf

# # Set working directory
# WORKDIR /var/www

# # Copy application files
# COPY . .

# # Install Composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# # Install PHP dependencies via Composer
# RUN composer install --no-interaction --prefer-dist --optimize-autoloader

# # Copy PHP configuration file
# COPY ./php.ini /usr/local/etc/php/conf.d/

# # Install Node, build assets, etc.
# RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.2/install.sh | bash && \
#     \. "$HOME/.nvm/nvm.sh" && \
#     nvm install 22 && \
#     npm i && npm run build

# # Copy Supervisor configuration files
# COPY ./supervisor/watchwithme-worker.conf /etc/supervisor/conf.d/watchwithme-worker.conf
# COPY ./supervisor/supervisord.conf /etc/supervisor/supervisord.conf

# # Copy and set entrypoint script
# COPY ./entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh

# # Run Laravel artisan commands
# RUN php artisan key:generate \
#     && php artisan storage:link \
#     && php artisan optimize:clear

# # Set permissions for storage directories
# RUN chmod 775 -R storage \
#     && chmod 775 -R bootstrap/cache \
#     && chmod 775 -R public

# # Expose port 9000
# EXPOSE 9000

# # Set entrypoint
# CMD ["/entrypoint.sh"]

ARG phpVersion=8.2
FROM php:${phpVersion}-fpm
ARG WORKDIR=/var/www/html
ENV DOCUMENT_ROOT=${WORKDIR}
ENV LARAVEL_PROCS_NUMBER=1
ENV DOMAIN=_
ENV CLIENT_MAX_BODY_SIZE=5G
ENV NODE_VERSION=22.x
ARG GROUP_ID=1000
ARG USER_ID=1000
ENV USER_NAME=www-data
ARG GROUP_NAME=www-data
# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libmemcached-dev \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    librdkafka-dev \
    libpq-dev \
    openssh-server \
    zip \
    unzip \
    supervisor \
    sqlite3  \
    nano \
    cron \
    ffmpeg

RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash -
# Install Node
RUN apt-get install -y nodejs
# Install nginx
RUN apt-get update && apt-get install -y nginx

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
# Install Kafka
RUN git clone https://github.com/arnaud-lb/php-rdkafka.git\
    && cd php-rdkafka \
    && phpize \
    && ./configure \
    && make all -j 5 \
    && make install

# Install Rdkafka and enable it
RUN docker-php-ext-enable rdkafka \
    && cd .. \
    && rm -rf /php-rdkafka

# Install PHP extensions zip, mbstring, exif, bcmath, intl
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install  zip mbstring exif pcntl bcmath -j$(nproc) gd intl

# Install Redis and enable it
RUN pecl install redis  && docker-php-ext-enable redis

# Install the php memcached extension
RUN pecl install memcached && docker-php-ext-enable memcached

# Install the PHP pdo_mysql extention
RUN docker-php-ext-install pdo_mysql

# Install the PHP pdo_pgsql extention
RUN docker-php-ext-install pdo_pgsql

# Install PHP Opcache extention
RUN docker-php-ext-install opcache

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Set working directory
WORKDIR $WORKDIR

RUN rm -Rf /var/www/* && \
    mkdir -p /var/www/html

COPY . .
ADD ./docker/php.ini $PHP_INI_DIR/conf.d/
ADD ./docker/opcache.ini $PHP_INI_DIR/conf.d/
ADD ./docker/supervisor/supervisord.conf /etc/supervisor/supervisord.conf

COPY ./entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh && \
    ln -s /usr/local/bin/entrypoint.sh /

RUN rm -rf /etc/nginx/conf.d/default.conf && \
    rm -rf /etc/nginx/sites-enabled/default && \
    rm -rf /etc/nginx/sites-available/default && \
    rm -rf /etc/nginx/nginx.conf

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./docker/nginx/default.conf /etc/nginx/conf.d/
COPY ./docker/nginx/ssl/server.crt /etc/nginx/ssl/server.crt
COPY ./docker/nginx/ssl/server.key /etc/nginx/ssl/server.key

RUN usermod -u ${USER_ID} ${USER_NAME} && \
    groupmod -g ${USER_ID} ${GROUP_NAME}

RUN mkdir -p /var/log/supervisor /var/log/nginx /var/cache/nginx

RUN composer install && npm i && npm run build

RUN php /var/www/html/artisan storage:link

RUN chown -R ${USER_NAME}:${GROUP_NAME} /var/www && \
    chown -R ${USER_NAME}:${GROUP_NAME} /var/log/ && \
    chown -R ${USER_NAME}:${GROUP_NAME} /etc/supervisor/conf.d/ && \
    chown -R ${USER_NAME}:${GROUP_NAME} $PHP_INI_DIR/conf.d/ && \
    touch /var/run/nginx.pid && \
    chown -R $USER_NAME:$USER_NAME /var/cache/nginx && \
    chown -R $USER_NAME:$USER_NAME /var/lib/nginx/ && \
    chown -R $USER_NAME:$USER_NAME /etc/nginx/nginx.conf && \
    chown -R $USER_NAME:$USER_NAME /var/run/nginx.pid && \
    chown -R $USER_NAME:$USER_NAME /var/log/supervisor && \
    chown -R $USER_NAME:$USER_NAME /etc/nginx/conf.d/ && \
    chown -R ${USER_NAME}:${GROUP_NAME} /tmp && \
    chmod -R 775 /var/www/html


#USER ${USER_NAME}
EXPOSE 80
ENTRYPOINT ["entrypoint.sh"]
