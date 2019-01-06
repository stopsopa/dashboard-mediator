
# node-js-getting-started

A barebones Node.js app using [Express 4](http://expressjs.com/).

This application supports the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

```sh
$ git clone git@github.com:heroku/node-js-getting-started.git # or clone your own fork
$ cd node-js-getting-started
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Documentation

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)

---

- [bitbucket deployment](https://confluence.atlassian.com/bitbucket/deploy-to-heroku-872013667.html)
    - [yt bitbucket deployment](https://www.youtube.com/watch?v=q-lwO5Pdqv0)
- [heroku login - dashboard](https://id.heroku.com/login)
- [heroku git clone](https://help.heroku.com/FZDDCBLB/how-can-i-download-my-code-from-heroku)
- [cli](https://devcenter.heroku.com/articles/exec)


Useful commands:

    # connecting to dyno via ssh
    heroku ps:exec
    
    heroku logs
    heroku logs --ps scheduler.1
    heroku ps
    heroku restart
    heroku ps:scale web=0
    heroku open
    
    # https://devcenter.heroku.com/articles/config-vars
    heroku config
    heroku config:get GITHUB_USERNAME
    heroku config:set GITHUB_USERNAME=joesmith
    heroku config:unset GITHUB_USERNAME
    
    # from https://devcenter.heroku.com/articles/how-heroku-works#releases
    heroku releases
    heroku releases:rollback v102
    
    # from https://devcenter.heroku.com/articles/how-heroku-works#dyno-manager
    heroku run bash
    heroku run "cd react/telegram && node test.js"
    
    # from https://devcenter.heroku.com/articles/buildpacks#setting-a-buildpack-on-an-application
    heroku buildpacks:set heroku/php
    
    # size of repos
    heroku apps:info
    
    # list and stop app dynos
    heroku ps
    heroku ps:stop web.1
    
    # scheduler
    heroku addons:open scheduler
    
# mysql database managemnet:

[ClearDB MySQL](https://devcenter.heroku.com/articles/cleardb)
    
    heroku addons:docs cleardb
    heroku addons:open cleardb

to see how to connect to db:

    heroku config | grep CLEARDB_DATABASE_URL
    
to access through HeidiSQL extract only host from *heroku config | grep CLEARDB_DATABASE_URL* like:
   
    mysql://xxxxxxxxxxxxxx:44444444@us-cdbr-iron-east-01.cleardb.net/heroku_444444444444444?reconnect=true
    to:
    us-cdbr-iron-east-01.cleardb.net <--- use only host part
    
... and use **username** and **password** extracted from *heroku addons:open cleardb*  
port regular for mysql 3306

WARNING: Sometimes it might be necessary to reset password through *heroku addons:open cleardb* panel (at least I had to)      
      
    
# read more:

- [clearing cache](https://devcenter.heroku.com/articles/git#build-cache)
- https://devcenter.heroku.com/articles/how-heroku-works#dyno-manager
- https://devcenter.heroku.com/articles/scheduler   
- (about free dyno)[https://devcenter.heroku.com/articles/free-dyno-hours]