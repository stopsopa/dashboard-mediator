[![npm version](https://badge.fury.io/js/%40stopsopa%2Fmediator.svg)](https://www.npmjs.com/package/@stopsopa/mediator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/stopsopa/dashboard-mediator/blob/master/LICENSE)


## Table of Contents

<!-- toc -->

- [What's that?](#whats-that)
- [Why?](#why)
- [Deploy locally](#deploy-locally)
- [To run local formation](#to-run-local-formation)
  * [Main service (mediator service)](#main-service-mediator-service)
  * [Passive service (just listening)](#passive-service-just-listening)
  * [Active service (only sending to mediator directly and to listener)](#active-service-only-sending-to-mediator-directly-and-to-listener)
  * [Standalone service (sending and listening)](#standalone-service-sending-and-listening)
- [Configuration of services](#configuration-of-services)
- [Using npm libraries to interact with mediator and attached services](#using-npm-libraries-to-interact-with-mediator-and-attached-services)
- [Deploy in heroku](#deploy-in-heroku)
- [Dev notes:](#dev-notes)

<!-- tocstop -->

# What's that?

It a server (let's call it "mediator" for the purpose of this doc) that is capable of registering multiple services (let's call them "child nodes") and later it can proxy incomming traffic between registered child nodes.  

As a part of this repository special libraries are provided to establish communication from child nodes in order to register such child node to mediator and establish connection with other child nodes. 

Each child node is registering to mediator under its own unique name, this name will be later used to refer particular child nodes in order to distinguish where traffic should be redirected after it reached mediator.

There is additional parameter that child node have to give during registration which is "group name". Groups are useful if dealing with multiple sets/formations/groups of many nodes, or example if there is need to broadcast message across multiple child nodes.

# Why?

Things get easier if in systems with multiple microservices (that have to communicate with each other) you have one common point of communication.   

Due to this architecture in case if particular microservice have to be moved to different machine there is usually no need to reconfigure other microservices to properly communicate with moved service.
    
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
    
# Configuration of services

There are two sets of passwords/keys: 

First is to encode body of each request this password have to be deployed to each children nodes but NOT to mediator main node. Mediator (main/parent) node doesn't have to know how to decrypt body of request it's responsibility is to just pass the request to another child node. By default it is **PROTECTED_AES256** that can be found in [example standalone service](standalone-node/.env)

Second key is used to authenticate incoming traffic from children nodes to mediator. In example code it is **PROTECTED_BASIC_AND_JWT** key.
        
# To run local formation

In order to create local formation of nodes, run accordingly:
(each instruction in separate terminal)


(**WARNING**: It's good idea to run mediator first because after that, all following client services will try to register itself to mediator, without this mediator won't be able to proxy traffic from one service to another)

## Main service (mediator service)

    make start
    
## Passive service (just listening)  

    make client
    
## Active service (only sending to mediator directly and to listener)

    make sender
    
## Standalone service (sending and listening)

[This](standalone-node/server.js) standalone service is actually very good example how to configure any application to communicate with or through mediator service.

Just remember about minimal [dependencies](standalone-node/package.json). 

    # go to other directory (beyound main repo) and run:
    npx @stopsopa/mediator
    # and follow instructio on the screen
    
At the end just visit all services through browser and check what's available.

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