[![Build Status](https://travis-ci.org/stopsopa/mediator.svg?branch=v0.0.45)](https://travis-ci.org/stopsopa/mediator)
[![npm version](https://badge.fury.io/js/%40stopsopa%2Fmediator.svg)](https://badge.fury.io/js/%40stopsopa%2Fmediator)
[![NpmLicense](https://img.shields.io/npm/l/@stopsopa/mediator.svg)](https://github.com/stopsopa/mediator/blob/master/LICENSE)




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
        

addidional tools
---    


    
        
    
    
    
    