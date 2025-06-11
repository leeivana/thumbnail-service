import rateLimit from "express-rate-limit";

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // @NOTE: Limit each IP to 100 requests per 15 minutes
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // @NOTE: Max limit per hour for uploads for hour
    message: "Too many file uploads from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
