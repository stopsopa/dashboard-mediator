
const endpoint = '/keep-awake';

const now = () => (new Date()).toISOString().substring(0, 19).replace('T', ' ');

module.exports = app => {

    const keepurl = process.env.KEEP_AWAKE;

    if ( ! keepurl ) {

        console.log(`process.env.KEEP_AWAKE is not defined`)

        return;
    }

    let fullUrl = keepurl + endpoint;

    // fullUrl = 'https://dashboard-mediator.herokuapp.com/test?a=bcde';

    app.all('/keep-awake', (req, res) => res.json({
        ok: true,
    }));
    
    /**
     * "... Applications that use the free dyno type will sleep after 30 minutes of inactivity ..."
     * from:
     *      https://devcenter.heroku.com/articles/how-heroku-works#runtime
     * ... so:
     *      let's so execute again after 25 minutes
     */
    const again = 25 * 60 * 1000;
    // const again = 10 * 1000; // for test

    function awake(label) {

        if ( ! label ) {

            throw `label can't be empty`;
        }

        label = now() + ' - ' + label;

        console.log(`[${label}]: attempt to request to '${fullUrl}' ... (async)`);

        fetch(fullUrl)
            .then(res => res.json())
            .then(json => {

                console.log(`[${label}]: keep-awake '${fullUrl}' then: `, json);

                if ( json.ok !== true ) {

                    console.log(`[${label}]: request to '${fullUrl}' failed: wrong response body: ` + JSON.stringify(json, null, 4));

                    process.exit(1);

                }

                console.log(`[${label}]: keep-awake: success`);

                setTimeout(awake, again, 'awake');

            }, e => {

                console.log(`[${label}]: keep-awake '${fullUrl}' catch: ` + (e + ''))

                process.exit(1);
            })
        ;
    }

    setTimeout(awake, 3000, 'first test');
};



