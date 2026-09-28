const http = require("http");

const server = http.createServer((req, res) => {
  const { method, url } = req;

  // GET /
  if (method === "GET" && url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html"
    });

    res.end("<h1>Hello</h1>");
  }

  // GET /json
  else if (method === "GET" && url === "/json") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({ ok: true }));
  }

  // POST /echo
  else if (method === "POST" && url === "/echo") {
    let body = "";

    // Receive request body in chunks
    req.on("data", (chunk) => {
      body += chunk;
    });

    // Body completely received
    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        res.writeHead(200, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify(data));
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          error: "Invalid JSON"
        }));
      }
    });
  }

  // Route not found
  else {
    res.writeHead(404, {
      "Content-Type": "text/plain"
    });

    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});