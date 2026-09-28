
// The http module allows you to create an HTTP server without Express.

// const http = require("http");

// const server = http.createServer((req, res) => {

//     res.end("Hello from Node.js");

// });

// server.listen(3000, () => {

//     console.log("Server running on port 3000");

// });

// -----------------------------------------------

//  Handling Different URLs

const http = require("http");

const server = http.createServer((req, res) => {

    if (req.url === "/") {

        res.end("Home");

    } else if (req.url === "/about") {

        res.end("About");

    } else {

        res.statusCode = 404;
        res.end("Not Found");

    }

});

server.listen(3000);