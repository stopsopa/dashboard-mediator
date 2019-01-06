
set -e
set -x

if [ -e .env ]; then

    echo '.env exist'
else

    echo ".env doen't exist - copying .env.heroku to .env"

    cp .env.heroku .env
fi

# (cd migrations && yarn)
(cd migrations && ln -s ../node_modules .)
make fixtures