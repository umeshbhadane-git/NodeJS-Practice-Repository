const express = require("express");
const { z } = require("zod");
const fs = require("fs");
const path = require("path");

const notes = require("../data/notes");

const AppError = require("../errors/AppError");
const requireAuth = require("../middleware/requireAuth");
const upload = require("../middleware/upload");

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
// ========================================

router.get("/", (req, res, next) => {

    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;

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

    const userNotes = notes.filter(
        note => note.userId === req.user.userId
    );

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
// ========================================

router.post("/", (req, res, next) => {

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
        id: notes.length + 1,
        userId: req.user.userId,
        title: result.data.title,
        content: result.data.content,
        attachment: null
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

    const note = notes.find(
        note =>
            note.id === id &&
            note.userId === req.user.userId
    );

    if (!note) {
        return next(
            new AppError("Note not found", 404)
        );
    }

    const result = updateNoteSchema.safeParse(req.body);

    if (!result.success) {
        return next(
            new AppError(
                result.error.issues[0].message,
                400
            )
        );
    }

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

    const index = notes.findIndex(
        note =>
            note.id === id &&
            note.userId === req.user.userId
    );

    if (index === -1) {
        return next(
            new AppError("Note not found", 404)
        );
    }

    const note = notes[index];

    // Delete attachment from disk if it exists

    if (note.attachment) {

        const filePath = path.resolve(
            note.attachment.path
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    notes.splice(index, 1);

    res.status(204).send();
});


// ========================================
// POST /notes/:id/attachment
// Upload image
// ========================================

router.post(
    "/:id/attachment",
    upload.single("attachment"),
    (req, res, next) => {

        const id = Number(req.params.id);

        // Find only user's note

        const note = notes.find(
            note =>
                note.id === id &&
                note.userId === req.user.userId
        );

        if (!note) {

            // If file was uploaded but note doesn't
            // belong to the user, remove it.

            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            return next(
                new AppError(
                    "Note not found",
                    404
                )
            );
        }


        // No file uploaded

        if (!req.file) {
            return next(
                new AppError(
                    "Attachment is required",
                    400
                )
            );
        }


        // Delete previous attachment

        if (note.attachment) {

            const oldPath = path.resolve(
                note.attachment.path
            );

            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }


        // Save attachment information

        note.attachment = {
            filename: req.file.filename,
            path: req.file.path,
            mimetype: req.file.mimetype
        };


        res.status(201).json({
            success: true,
            message: "Attachment uploaded successfully",
            data: {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            }
        });

    }
);


// ========================================
// GET /notes/:id/attachment
// Stream attachment
// ========================================

router.get(
    "/:id/attachment",
    (req, res, next) => {

        const id = Number(req.params.id);

        // Find only user's note

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


        if (!note.attachment) {
            return next(
                new AppError(
                    "This note has no attachment",
                    404
                )
            );
        }


        const filePath = path.resolve(
            note.attachment.path
        );


        if (!fs.existsSync(filePath)) {
            return next(
                new AppError(
                    "Attachment file not found",
                    404
                )
            );
        }


        // Set content type

        res.setHeader(
            "Content-Type",
            note.attachment.mimetype
        );


        // Create readable stream

        const fileStream = fs.createReadStream(
            filePath
        );


        fileStream.on("error", (error) => {
            next(error);
        });


        // Stream file to client

        fileStream.pipe(res);

    }
);


module.exports = router;