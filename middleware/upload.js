const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const extension = path.extname(file.originalname);

        const uniqueName =
            `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;

        cb(null, uniqueName);
    }
});


const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error("Only JPG and PNG images are allowed"),
            false
        );
    }
};


const upload = multer({

    storage,

    limits: {
        fileSize: 2 * 1024 * 1024
    },

    fileFilter

});


module.exports = upload;