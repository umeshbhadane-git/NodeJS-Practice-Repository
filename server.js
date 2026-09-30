require("dotenv").config();

const express = require("express");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = 5000;


// ========================================
// Built-in middleware
// ========================================

app.use(express.json());


// ========================================
// Authentication routes
// ========================================

app.use("/auth", authRoutes);


// ========================================
// Protected notes routes
// ========================================

app.use("/notes", noteRoutes);


// ========================================
// 404 handler
// ========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        error: {
            message: "Route not found"
        }
    });

});


// ========================================
// Central error handler
// ========================================

app.use(errorHandler);


// ========================================
// Start server
// ========================================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});