const express = require("express");
const AppError = require("../errors/AppError");

const router = express.Router();

let users = [
    {
        id: 1,
        name: "Umesh",
        email: "umesh@gmail.com"
},
    {
        id: 2,
        name: "Rahul",
        email: "rahul@gmail.com"
    }
];

// GET /api/users
router.get("/", (req, res) => {

    res.json(users);

});

// GET /api/users/:id
router.get("/:id", (req, res, next) => {

    const id = Number(req.params.id);

    const user = users.find(user => user.id === id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.json(user);

});

// POST /api/users
router.post("/", (req, res, next) => {

    const { name, email } = req.body;

    if (!name || !email) {
        return next(
            new AppError("Name and email are required", 400)
        );
    }

    const newUser = {
        id: users.length + 1,
        name,
        email
    };

    users.push(newUser);

    res.status(201).json(newUser);

});

// DELETE /api/users/:id
router.delete("/:id", (req, res, next) => {

    const id = Number(req.params.id);

    const userExists = users.some(user => user.id === id);

    if (!userExists) {
        return next(new AppError("User not found", 404));
    }

    users = users.filter(user => user.id !== id);

    res.json({
        message: "User deleted successfully"
    });

});

module.exports = router;