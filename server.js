const express = require("express");

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

app.use("/notes", noteRoutes);


// ========================================
// 404 route
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