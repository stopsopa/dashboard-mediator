[![npm version](https://badge.fury.io/js/%40stopsopa%2Fmediator.svg)](https://www.npmjs.com/package/@stopsopa/mediator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/stopsopa/dashboard-mediator/blob/master/LICENSE)


## Table of Contents

<!-- toc -->

- [deploy in heroku](#deploy-in-heroku)
- [to update project just change code, commit and run:](#to-update-project-just-change-code-commit-and-run)
- [deploy locally](#deploy-locally)
- [to run local formation](#to-run-local-formation)
  * [main service (mediator service)](#main-service-mediator-service)
  * [passive service (just listening)](#passive-service-just-listening)
  * [active service (only sending to mediator directly and to listener)](#active-service-only-sending-to-mediator-directly-and-to-listener)
  * [standalone service (sending and listening)](#standalone-service-sending-and-listening)

<!-- tocstop -->

# deploy in heroku

    git clone git@github.com:stopsopa/dashboard-mediator.git dashboard-mediator/runtime
    cd dashboard-mediator/runtime
    
    heroku login
    
    # check if
    heroku config
    # has correct CLEARDB_DATABASE_URL env variable 
    # can be set by: 
    #       heroku config:set CLEARDB_DATABASE_URL="mysql://username:password@us-cdbr-iron-east-01.cleardb.net/database_name?reconnect=true"
    # for more details see HOROKU.md   
    
    heroku create dashboard-mediator
    
    make u
    
# to update project just change code, commit and run:

    make u  
    
# deploy locally

    # copy .env
    cp .env.local .env
    # run docker mysql
    make doc       
    # fixtures
    make fixtures
    # run server
    node index.js
    # finish
        
# to run local formation

In order to create local formation of nodes run accordingly:
(each instruction in separate terminal)


(**WARNING**: It's good idea to run mediator first because after that all following client services will try to register itself to mediator, without this mediator won't be able to proxy traffic from one service to another)

## main service (mediator service)

    make start
    
## passive service (just listening)  

    make client
    
## active service (only sending to mediator directly and to listener)

    make sender
    
## standalone service (sending and listening)

    # go to other directory (beyound main repo) and run:
    npx @stopsopa/mediator
    # and follow instructio on the screen
    
At the end just visit all services through browser and check what's available.