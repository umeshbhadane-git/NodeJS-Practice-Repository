const jwt = require("jsonwebtoken");

const AppError = require("../errors/AppError");

const JWT_SECRET = process.env.JWT_SECRET;

const requireAuth = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(
            new AppError(
                "Authentication required",
                401
            )
        );
    }


    // Expected format:
    // Authorization: Bearer TOKEN

    const parts = authHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {
        return next(
            new AppError(
                "Invalid authorization format",
                401
            )
        );
    }


    const token = parts[1];


    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        // Store decoded JWT payload
        // on request object

        req.user = decoded;

        next();

    } catch (error) {

        return next(
            new AppError(
                "Invalid or expired token",
                401
            )
        );
    }
};

module.exports = requireAuth;