import express, { Request, Response } from "express";
import { upload } from "../utils/fileStorage";
import { createJob, getJobById, getJobs } from "./job.service";
import { jobStatuses } from "../types";
import { join } from "path";
import { THUMBNAIL_DIR } from "../constants";
import { access } from "fs/promises";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../errors/httpError";
import {
    apiLimiter,
    uploadLimiter,
} from "../middlewares/rateLimiter.middleware";

export const jobRouter = express.Router();

// @NOTE: Applying rate limiter to routes
jobRouter.use(apiLimiter);

jobRouter.post(
    "/upload",
    uploadLimiter, // @NOTE: Specific rate limiter for upload limits
    upload.single("image"),
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            throw new HttpError(400, "Image file is required");
        }
        const { originalname, filename } = req.file;
        const jobId = await createJob(originalname, filename);
        res.json({ jobId });
    })
);

jobRouter.get(
    "/thumbnail/:jobId",
    asyncHandler(async (req: Request, res: Response) => {
        const { jobId } = req.params;
        if (!jobId) {
            throw new HttpError(400, "Job Id is required");
        }

        const job = await getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        const { thumbnailFilename = "", status } = job;
        if (status !== jobStatuses.succeeded || !thumbnailFilename) {
            throw new HttpError(500, "Thumbnail file is not available");
        }

        const thumbnailPath = join(THUMBNAIL_DIR, thumbnailFilename);
        await access(thumbnailPath);
        res.sendFile(thumbnailPath);
    })
);

jobRouter.get(
    "/status/:jobId",
    asyncHandler(async (req: Request, res: Response) => {
        const { jobId } = req.params;
        if (!jobId) {
            throw new HttpError(400, "Job Id is required");
        }

        const job = await getJobById(jobId);
        if (!job) {
            throw new HttpError(404, "Job not found");
        }

        res.json({ status: job.status });
    })
);

jobRouter.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {
        const jobs = await getJobs();
        res.json({ jobs });
    })
);
