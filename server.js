require("dotenv").config();

const express = require("express");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

const PORT = 5000;


// ========================================
// Middleware
// ========================================

app.use(express.json());


// ========================================
// Routes
// ========================================

app.use("/auth", authRoutes);

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
// Error handler
// ========================================

app.use(errorHandler);


// ========================================
// Start server only when directly executed
// ========================================

if (require.main === module) {

    app.listen(PORT, () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    });

}


// Export app for Supertest

module.exports = app;