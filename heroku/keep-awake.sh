
set -e
set -x

trim() {
    local var="$*"
    # remove leading whitespace characters
    var="${var#"${var%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    var="${var%"${var##*[![:space:]]}"}"
    echo -n "$var"
}

TMP="$(heroku info | grep "Web URL")"
DOMAIN=${TMP:16:500}
DOMAIN="$(trim "$DOMAIN")"
DOMAIN="$(node keep-awake.js "$DOMAIN")"

REG="^https?://"

if ! [[ $DOMAIN =~ $REG ]]; then

    echo "heroku domain >>$DOMAIN<< is not starting from http:// nor https://"

    exit 1;
fi

CURRENT_KEEP_AWAKE="$(heroku config:get KEEP_AWAKE)";

if [ "$DOMAIN" != "$CURRENT_KEEP_AWAKE" ]; then

    heroku config:set KEEP_AWAKE="$DOMAIN"
    heroku config:get KEEP_AWAKE
fi

echo 'all good'
