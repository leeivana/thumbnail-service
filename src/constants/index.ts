import { join, dirname } from "path";

export const THUMBNAIL_QUEUE = "thumbnail-queue";
export const MAX_FILE_SIZE = process.env.MAX_FILE_SIZE
    ? parseInt(process.env.MAX_FILE_SIZE)
    : 10 * 1024 * 1024; // @NOTE: Default at 10MB

const PROJECT_ROOT = join(dirname(__dirname), "..");

export const UPLOAD_DIR = join(PROJECT_ROOT, "uploads");
export const THUMBNAIL_DIR = join(PROJECT_ROOT, "thumbnails");

export const THUMBNAIL_SIZE = 100;
