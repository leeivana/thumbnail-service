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
import { jobStatuses, Schema } from "../types";
import { updateJob } from "../jobs/job.service";

// @NOTE: Redis connection
const connection = new IORedis({ maxRetriesPerRequest: null });

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
