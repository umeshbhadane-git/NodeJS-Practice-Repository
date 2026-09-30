const express = require("express");
const { z } = require("zod");

const notes = require("../data/notes");

const AppError = require("../errors/AppError");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();


// ========================================
// All note routes require authentication
// ========================================

router.use(requireAuth);


// ========================================
// Validation schemas
// ========================================

const createNoteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required")
});


const updateNoteSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    content: z.string().min(1, "Content cannot be empty").optional()
});


// ========================================
// GET /notes
// Pagination
// ?limit=10&offset=0
// ========================================

router.get("/", (req, res, next) => {

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;


    // Validate pagination values

    if (
        !Number.isInteger(limit) ||
        !Number.isInteger(offset) ||
        limit <= 0 ||
        offset < 0
    ) {
        return next(
            new AppError(
                "Invalid pagination parameters",
                400
            )
        );
    }


    // Get only current user's notes

    const userNotes = notes.filter(
        note => note.userId === req.user.userId
    );


    // Apply pagination

    const paginatedNotes = userNotes.slice(
        offset,
        offset + limit
    );


    res.json({
        success: true,
        data: paginatedNotes,
        pagination: {
            limit,
            offset,
            total: userNotes.length
        }
    });

});


// ========================================
// GET /notes/:id
// ========================================

router.get("/:id", (req, res, next) => {

    const id = Number(req.params.id);


    const note = notes.find(
        note =>
            note.id === id &&
            note.userId === req.user.userId
    );


    if (!note) {

        return next(
            new AppError(
                "Note not found",
                404
            )
        );
    }


    res.json({
        success: true,
        data: note
    });

});


// ========================================
// POST /notes
// ========================================

router.post("/", (req, res, next) => {

    const result = createNoteSchema.safeParse(
        req.body
    );


    if (!result.success) {

        return next(
            new AppError(
                result.error.issues[0].message,
                400
            )
        );
    }


    const newNote = {

        id: notes.length + 1,

        // IMPORTANT:
        // Get user ID from verified JWT,
        // NOT from request body.

        userId: req.user.userId,

        title: result.data.title,

        content: result.data.content
    };


    notes.push(newNote);


    res.status(201).json({
        success: true,
        data: newNote
    });

});


// ========================================
// PATCH /notes/:id
// ========================================

router.patch("/:id", (req, res, next) => {

    const id = Number(req.params.id);


    // Find only if note belongs to current user

    const note = notes.find(
        note =>
            note.id === id &&
            note.userId === req.user.userId
    );


    if (!note) {

        return next(
            new AppError(
                "Note not found",
                404
            )
        );
    }


    // Validate partial update

    const result = updateNoteSchema.safeParse(
        req.body
    );


    if (!result.success) {

        return next(
            new AppError(
                result.error.issues[0].message,
                400
            )
        );
    }


    // Update only provided fields

    if (result.data.title !== undefined) {

        note.title = result.data.title;

    }


    if (result.data.content !== undefined) {

        note.content = result.data.content;

    }


    res.json({
        success: true,
        data: note
    });

});


// ========================================
// DELETE /notes/:id
// ========================================

router.delete("/:id", (req, res, next) => {

    const id = Number(req.params.id);


    // Find only user's note

    const index = notes.findIndex(
        note =>
            note.id === id &&
            note.userId === req.user.userId
    );


    if (index === -1) {

        return next(
            new AppError(
                "Note not found",
                404
            )
        );
    }


    notes.splice(index, 1);


    // 204 = successful, no response body

    res.status(204).send();

});


module.exports = router;