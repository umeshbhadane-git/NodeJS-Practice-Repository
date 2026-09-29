const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

const users = [
    {
        id: 1,
        name: "Umesh"
    },
    {
        id: 2,
        name: "Rahul"
    }
];

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Third-party middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Simple middleware
app.use((req, res, next) => {

    console.log("Request received");

    next();

});

// GET
app.get("/users", (req, res) => {

    res.json(users);

});

// GET with route parameter
app.get("/users/:id", (req, res) => {

    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    res.json(user);

});

// POST
app.post("/users", (req, res) => {

    console.log(req.body);

    res.status(201).json({
        message: "User created",
        user: req.body
    });

});

// Error middleware
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        message: "Internal Server Error"
    });

});

app.listen(3000, () => {

    console.log("Server running on port 3000");

});