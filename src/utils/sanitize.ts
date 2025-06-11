import sanitize from "sanitize-filename";

export function sanitizeFilename(filename: string) {
    return sanitize(filename);
}
