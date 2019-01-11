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

# What's that?

# Why?
    
# Deploy locally

    # copy .env and SETUP EVERYTHING PROPERLY IN .env
    cp .env.local .env
    # run docker mysql
    make doc       
    # fixtures
    make fixtures
    # run server
    node index.js
    # finish
        
# To run local formation

In order to create local formation of nodes run accordingly:
(each instruction in separate terminal)


(**WARNING**: It's good idea to run mediator first because after that all following client services will try to register itself to mediator, without this mediator won't be able to proxy traffic from one service to another)

## Main service (mediator service)

    make start
    
## Passive service (just listening)  

    make client
    
## Active service (only sending to mediator directly and to listener)

    make sender
    
## Standalone service (sending and listening)

[This](standalone-node/server.js) standalone service is actually very good example how to configure any aplication to communicate with or through mediator service.

Just remember about minimal [dependencies](standalone-node/package.json) for this example. 

    # go to other directory (beyound main repo) and run:
    npx @stopsopa/mediator
    # and follow instructio on the screen
    
At the end just visit all services through browser and check what's available.

# Configuration of services

# Using npm libraries to interact with mediator and attached services


# Deploy in heroku

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
    
# Dev notes:

To update project just change what's necessary and run:

    make u  
    
... of course you have to be logged to npm (*npm login*)    