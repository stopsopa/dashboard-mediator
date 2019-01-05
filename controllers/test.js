
// https://nodejs.org/api/http.html#http_class_http_serverresponse
    
const controller = (req, res, query = {}) => {

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    //res.statusCode = 404;

    res.end(JSON.stringify({
        page: {
            query,
        },
        v: process.version
    }));
}

controller.url = '/test';

module.exports = controller;
