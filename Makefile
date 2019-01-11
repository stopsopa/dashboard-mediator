
# https://docs.docker.com/compose/reference/envvars/#compose_project_name
COMPOSE_PROJECT_NAME:="$(shell cat docker/name.conf)"

export COMPOSE_PROJECT_NAME

u: # push to github & release in heroku
	@/bin/bash update.sh

uf: # update even if there is nothing new committed
	@/bin/bash update.sh force
t:
	/bin/bash test.sh

cn: # bring npm parameters.json
	@/bin/bash update.sh --npm

cp: # bring github parameters.json
	@/bin/bash update.sh --prod

nt: # test .npmignore
	@npm pack

start: linknpm
	node index.js

sender: linknpm
	node testClientSender.js

client:
	node testClient.js

islinked:
	@cd dev && /bin/bash islinked.sh

link:
	npm link

unlink:
	@cd dev && /bin/bash unlink.sh

linknpm:
	(cd public && ln -s ../node_modules public) | true
	(cd publicSender && ln -s ../node_modules public) | true

doc: docs
	(cd docker && docker-compose build)
	(cd docker && docker-compose up -d --build)

docs:
	cd docker && docker-compose stop

fixtures:
	(cd migrations && node recreate-db.js safe)
	(cd migrations && make mrun)

diff:
	(cd migrations && make diff)

mrun:
	(cd migrations && make mrun)

torun:
	(cd migrations && make torun)

mrevert:
	(cd migrations && make mrevert)


