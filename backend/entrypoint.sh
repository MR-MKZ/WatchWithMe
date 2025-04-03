#!/bin/sh

echo ""
echo "***********************************************************"
echo " Starting NGINX PHP-FPM Docker Container                   "
echo "***********************************************************"

set -e
set -e
info() {
    { set +x; } 2> /dev/null
    echo '[INFO] ' "$@"
}
warning() {
    { set +x; } 2> /dev/null
    echo '[WARNING] ' "$@"
}
fatal() {
    { set +x; } 2> /dev/null
    echo '[ERROR] ' "$@" >&2
    exit 1
}

sleep 20

## Check if the artisan file exists
if [ -f /var/www/html/artisan ]; then
    info "Artisan file found, creating laravel supervisor config"
    # Set DocumentRoot to the Laravel project directory
    export DOCUMENT_ROOT=/var/www/html/public
    ##Create Laravel Scheduler process
    TASK=/etc/supervisor/conf.d/laravel-worker.conf
    touch $TASK
    cat > "$TASK" <<EOF
    [program:watchwithme-worker]
    process_name=%(program_name)s_%(process_num)02d
    command=php /var/www/html/artisan queue:work --timeout=0 --sleep=3 --tries=3
    autostart=true
    autorestart=true
    numprocs=$LARAVEL_PROCS_NUMBER
    user=$USER_NAME
    redirect_stderr=true
    stdout_logfile=/var/log/watchwithme_worker.log
EOF
    info  "Laravel supervisor config created"

    info "Generating laravel migration"
    php /var/www/html/artisan migrate --force
    info "Laravel migration generated"

    # info "Laravel storage link"
    # php /var/www/html/artisan storage:link
    # info "Laravel storage link created"

else
    info  "artisan file not found"
fi

## Start Supervisord
supervisord -c /etc/supervisor/supervisord.conf
