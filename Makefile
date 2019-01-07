
# https://docs.docker.com/compose/reference/envvars/#compose_project_name
COMPOSE_PROJECT_NAME:="$(shell cat docker/name.conf)"

export COMPOSE_PROJECT_NAME

u: # push to github & release in heroku
	@/bin/bash update.sh

uf: # update even if there is nothing new committed
	@/bin/bash update.sh force
t:
	/bin/bash test.sh

start:
	node index.js

doc: docs
	(cd docker && docker-compose build)
	(cd docker && docker-compose up -d --build)

docs:
	cd docker && docker-compose stop

fixtures:
	(cd migrations && node recreate-db.js safe)
	(cd migrations && make mrun)


