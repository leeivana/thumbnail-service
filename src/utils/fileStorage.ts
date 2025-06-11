import multer from "multer";
import { nanoid } from "nanoid";
import { UPLOAD_DIR, MAX_FILE_SIZE, THUMBNAIL_DIR } from "../constants";
import { sanitizeFilename } from "./sanitize";
import { mkdir } from "fs/promises";

// @NOTE: Making directories in the case where they don't exist
export const makeDirectories = async () => {
    try {
        await mkdir(UPLOAD_DIR, { recursive: true });
        await mkdir(THUMBNAIL_DIR, { recursive: true });

        console.log("Successfully created directories");
    } catch (err) {
        console.error("Failed to create directories:", {
            error: err,
            uploadDir: UPLOAD_DIR,
            thumbnailDir: THUMBNAIL_DIR,
        });
        throw err;
    }
};

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const sanitized = sanitizeFilename(file.originalname);
        const ext = sanitized.substring(sanitized.lastIndexOf("."));
        cb(null, `image-${nanoid()}${ext}`);
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
    },
});
