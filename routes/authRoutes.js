const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const users = require("../data/users");
const AppError = require("../errors/AppError");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;


// ========================================
// Validation schemas
// ========================================

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});


const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required")
});


// ========================================
// POST /auth/register
// ========================================

router.post("/register", async (req, res, next) => {

    try {

        // Validate request
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {

            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }


        const { name, email, password } = result.data;


        // Check existing user

        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {

            return next(
                new AppError(
                    "User with this email already exists",
                    409
                )
            );
        }


        // Hash password

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // Create user

        const user = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword
        };


        users.push(user);


        // Never send password back

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        next(error);

    }
});


// ========================================
// POST /auth/login
// ========================================

router.post("/login", async (req, res, next) => {

    try {

        // Validate request

        const result = loginSchema.safeParse(req.body);

        if (!result.success) {

            return next(
                new AppError(
                    result.error.issues[0].message,
                    400
                )
            );
        }


        const { email, password } = result.data;


        // Find user

        const user = users.find(
            user => user.email === email
        );


        if (!user) {

            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }


        // Compare password

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );


        if (!passwordMatches) {

            return next(
                new AppError(
                    "Invalid email or password",
                    401
                )
            );
        }


        // Create JWT

        const token = jwt.sign(
            {
                userId: user.id
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );


        res.json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {

        next(error);

    }
});


module.exports = router;