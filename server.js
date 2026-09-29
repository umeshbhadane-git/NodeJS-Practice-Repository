const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const userRoutes = require("./routes/userRoutes");

const app = express();

const PORT = 5000;


// ============================
// Built-in Middleware
// ============================

app.use(express.json());


// ============================
// Logging Middleware
// ============================

app.use(logger);


// ============================
// CORS
// ============================

app.use(
    cors({
        origin: "http://localhost:3000"
    })
);


// ============================
// Rate Limiting
// ============================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,

    message: {
        message: "Too many requests, please try again later."
    }
});

app.use(limiter);


// ============================
// Routes
// ============================

app.get("/", (req, res) => {

    res.json({
        message: "Node.js REST API is running"
    });

});

// For all routes
app.use("/api/users", userRoutes);


// ============================
// 404 Handler
// ============================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


// ============================
// Central Error Handler
// ============================

app.use(errorHandler);


// ============================
// Start Server
// ============================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});