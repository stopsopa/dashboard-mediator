
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
	node migrations/recreate-db.js
	(cd migrations && make mrun)


