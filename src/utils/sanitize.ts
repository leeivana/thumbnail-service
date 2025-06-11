import sanitize from "sanitize-filename";

export const sanitizeFilename = (filename: string) => {
    return sanitize(filename);
};
