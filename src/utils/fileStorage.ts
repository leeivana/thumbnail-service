import multer from "multer";
import { nanoid } from "nanoid";
import { UPLOAD_DIR, MAX_FILE_SIZE, THUMBNAIL_DIR } from "../constants";
import { sanitizeFilename } from "./sanitize";
import { mkdir } from "fs/promises";
import { HttpError } from "../errors/httpError";

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
    fileFilter: (
        _req: any,
        file: Express.Multer.File,
        cb: multer.FileFilterCallback
    ) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new HttpError(400, "Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});

// @NOTE: Error handler for multer to deal with large files
export const handleMulterError = (
    error: any,
    _req: any,
    _res: any,
    next: any
) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            next(
                new HttpError(
                    400,
                    `File too large. Maximum size is ${
                        MAX_FILE_SIZE / 1024 / 1024
                    }MB`
                )
            );
            return;
        }
        next(new HttpError(400, `Upload error: ${error.message}`));
        return;
    }
    next(error);
};
