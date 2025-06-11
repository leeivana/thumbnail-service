import { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError";

export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error(err);

    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }

    return res
        .status(500)
        .json({ error: err.message || "Internal Server Error" });
};
