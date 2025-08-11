const express = require('express');
const cors = require('cors');
const path = require('node:path')

const APP_PORT=80
const app = express();
app.disable('etag');
app.use(cors());

function started(){
    console.log(`[Server] sbetwebflowjs listening on port ${APP_PORT}`);
    console.log(`[Server] executing as ${__filename}`);
    console.log(`[Server] To exit press CTRL+C`);
}

    //Common Web crap
app.get("/robots.txt", function (req, res, next) {
    res.type("text/plain");
    return res.status(200).send("User-agent: *\nDisallow: /");
});
app.get("/favicon.ico", function (req, res, next) {
    res.type("image/x-icon");
    return res.status(301).send();
});
  
  
//static web page mapped to javascript folder
app.use(express.static(path.join(process.cwd(), "./javascript")));

// Mapping Unmatched URLs
app.use(function (req, res, next) {
    res.status(404);
    console.log(`Unmatched Request ${req.method} - ${req.path}`);
    next();
});

app.listen(APP_PORT, started );

