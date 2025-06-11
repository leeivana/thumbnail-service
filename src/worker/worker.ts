import { Queue, Worker, Job } from "bullmq";
import {
    THUMBNAIL_DIR,
    THUMBNAIL_QUEUE,
    UPLOAD_DIR,
    THUMBNAIL_SIZE,
} from "../constants";
import sharp from "sharp";
import { join } from "node:path";
import IORedis from "ioredis";
import { jobStatuses } from "../types";
import { updateJob } from "../jobs/job.service";

// @NOTE: Redis connection with retry logic
const connection = new IORedis(process.env.REDIS_URL || "redis://redis:6379", {
    // @NOTE: Exponential backoff strategy
    // Waiting longer to reconnect if there is a failure
    retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    },
    maxRetriesPerRequest: null,
});

connection.on("error", (err) => {
    console.error("Redis connection error:", err);
});

connection.on("connect", () => {
    console.log("Successfully connected to Redis");
});

// Setting up BullMQ queue
export const thumbnailQueue = new Queue(THUMBNAIL_QUEUE, { connection });

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
    { connection }
);

worker.on("failed", (job: Job | undefined, error) => {
    console.log(`Job with id ${job?.id} failed with ${error.message}`);
});

export default worker;
