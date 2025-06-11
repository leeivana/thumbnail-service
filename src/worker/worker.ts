import { Queue, Worker, Job } from "bullmq";
import {
    THUMBNAIL_DIR,
    THUMBNAIL_QUEUE,
    UPLOAD_DIR,
    THUMBNAIL_SIZE,
} from "../constants";
import sharp from "sharp";
import { join } from "node:path";
import { JSONFile } from "lowdb/node";
import { Low } from "lowdb";
import Redis from "ioredis";
import { jobStatuses, Schema } from "../types";
import { updateJob } from "../jobs/job.service";

// @NOTE: Redis connection
const redis = new Redis();

// Setting up BullMQ queue
export const thumbnailQueue = new Queue(THUMBNAIL_QUEUE, { connection: redis });

const dbFile = join(__dirname, "./db.json");
const db = new Low<Schema>(new JSONFile<Schema>(dbFile), { jobs: [] });

const worker = new Worker(
    THUMBNAIL_QUEUE,
    async (job: Job) => {
        const { data: { jobId, storedFileName = "" } = {} } = job;

        try {
            const thumbnailFilename = `${jobId}.png`;
            const thumbnailPath = join(THUMBNAIL_DIR, `${jobId}.png`);
            await sharp(join(UPLOAD_DIR, storedFileName))
                .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE)
                .png()
                .toFile(thumbnailPath);

            await updateJob({
                id: jobId,
                thumbnailFilename,
                status: jobStatuses.succeeded,
            });
        } catch (error) {
            await updateJob({
                id: jobId,
                status: jobStatuses.failed,
            });

            throw error;
        }
    },
    { connection: redis }
);

worker.on("failed", () => {});
