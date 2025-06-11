import { join } from "node:path";

export const THUMBNAIL_QUEUE = "thumbnail-queue";
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const UPLOAD_DIR = join(__dirname, "../uploads");
export const THUMBNAIL_DIR = join(__dirname, "../thumbnails");

export const THUMBNAIL_SIZE = 100;
