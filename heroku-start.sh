
if [ -e .env ]; then

    echo '.env exist'
else

    echo ".env doen't exist"

    cp .env.heroku .env
fi

node index.js