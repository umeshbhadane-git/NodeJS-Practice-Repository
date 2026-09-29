
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello Express");
});

// Request Params, Query Params
app.get("/users/:id", (req, res) => {

    console.log(req.params.id);

    res.send(`User ID: ${req.params.id}`);

});

app.post("/users", (req, res) => {

    res.send("Create user");

});

// ----------------------------------------

// Request Params
app.put("/users/:id", (req, res) => {

    console.log(req.params.id);

    res.send(`User ID: ${req.params.id}`);

    // res.send("Update user");

});

// Multiple route parameters
app.put("/users/:userId/orders/:orderId", (req, res) => {

    console.log(req.params);
    res.send(req.params);

});

// Query strings
app.put("/users", (req, res) => {

    console.log(req.query);
    res.json(req.query);
    res.send(req.query);

});

// ----------------------------------------

app.patch("/users/:id", (req, res) => {

    res.send("Partially update user");

});

app.delete("/users/:id", (req, res) => {

    res.send("Delete user");

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});