const express = require("express");
const { z } = require("zod");

const AppError = require("../errors/AppError");

const router = express.Router();


// ========================================
// In-memory storage
// ========================================

let notes = [
    {
        id: 1,
        title: "Learn Node.js",
        content: "Study Express and REST APIs"
    },
    {
        id: 2,
        title: "Learn MongoDB",
        content: "Practice MongoDB CRUD operations"
    },
    {
        id: 3,
        title: "Learn React",
        content: "Practice components and hooks"
    }
];

let nextId = 4;


// ========================================
// Zod validation schema
// ========================================

const createNoteSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required")
});


// PATCH schema
// Both fields are optional because PATCH
// means partial update.

const updateNoteSchema = z.object({
    title: z.string().min(1, "Title cannot be empty").optional(),
    content: z.string().min(1, "Content cannot be empty").optional()
});


// ========================================
// GET /notes
// List notes with pagination
// ?limit=10&offset=0
// ========================================

router.get("/", (req, res) => {

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

    const paginatedNotes = notes.slice(
        offset,
        offset + limit
    );

    res.json({
        success: true,
        data: paginatedNotes,
        pagination: {
            limit,
            offset,
            total: notes.length
        }
    });
});


// ========================================
// GET /notes/:id
// Get single note
// ========================================

router.get("/:id", (req, res, next) => {

    const id = Number(req.params.id);

    const note = notes.find(note => note.id === id);

    if (!note) {
        return next(
            new AppError("Note not found", 404)
        );
    }

    res.json({
        success: true,
        data: note
    });
});


// ========================================
// POST /notes
// Create note
// ========================================

router.post("/", (req, res, next) => {

    // Validate request body
    const result = createNoteSchema.safeParse(req.body);

    if (!result.success) {

        return next(
            new AppError(
                result.error.issues[0].message,
                400
            )
        );
    }

    const newNote = {
        id: nextId++,
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
// Partial update
// ========================================

router.patch("/:id", (req, res, next) => {

    const id = Number(req.params.id);

    const note = notes.find(note => note.id === id);

    if (!note) {
        return next(
            new AppError("Note not found", 404)
        );
    }

    // Validate partial body
    const result = updateNoteSchema.safeParse(req.body);

    if (!result.success) {

        return next(
            new AppError(
                result.error.issues[0].message,
                400
            )
        );
    }

    // Update only fields that were supplied
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

    const noteIndex = notes.findIndex(
        note => note.id === id
    );

    if (noteIndex === -1) {
        return next(
            new AppError("Note not found", 404)
        );
    }

    notes.splice(noteIndex, 1);

    // 204 = successful deletion,
    // no response body
    res.status(204).send();
});


module.exports = router;