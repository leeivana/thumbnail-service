import request from "supertest";
import { app } from "../../app";
import path from "path";
import fs from "fs/promises";
import { IMAGE_PATH, THUMBNAIL_PATH, UPLOAD_PATH } from "../constants";
import { initDb } from "../../db/database";

// Mock Redis and BullMQ
jest.mock("ioredis");
jest.mock("bullmq");
jest.mock("../../worker/worker", () => ({
    thumbnailQueue: {
        add: jest.fn().mockResolvedValue({ id: "test-queue-id" }),
    },
}));

// Mock database models
jest.mock("../../db/models", () => ({
    getAllJobs: jest.fn().mockResolvedValue([]),
    addJob: jest.fn(),
    findJobById: jest.fn(),
    updateJobById: jest.fn(),
}));

beforeEach(async () => {
    // @NOTE: Removing and re-creating directories to remove stale test data
    await fs.rm(UPLOAD_PATH, { recursive: true, force: true });
    await fs.rm(THUMBNAIL_PATH, { recursive: true, force: true });
    await fs.mkdir(UPLOAD_PATH, { recursive: true });
    await fs.mkdir(THUMBNAIL_PATH, { recursive: true });
    await initDb();
});

afterEach(async () => {
    // @NOTE: Clean up after each test
    await fs.rm(UPLOAD_PATH, { recursive: true, force: true });
    await fs.rm(THUMBNAIL_PATH, { recursive: true, force: true });
});

describe("POST /jobs/upload", () => {
    it("should return 400 if no file is uploaded", async () => {
        const response = await request(app).post("/jobs/upload");
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Image file is required");
    });

    it("should return 400 if file is not an image", async () => {
        // Create a temporary text file
        const textFilePath = path.join(UPLOAD_PATH, "test.txt");
        await fs.writeFile(textFilePath, "This is not an image");

        const response = await request(app)
            .post("/jobs/upload")
            .attach("image", textFilePath);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Only image files are allowed");
    });

    it("should return 400 if file is too large", async () => {
        const largeFilePath = path.join(UPLOAD_PATH, "large.jpg");
        const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
        await fs.writeFile(largeFilePath, largeBuffer);

        const response = await request(app)
            .post("/jobs/upload")
            .attach("image", largeFilePath);

        expect(response.status).toBe(400);
        expect(response.body.error).toContain("File too large");
    });

    it("should return 400 if file field name is incorrect", async () => {
        const response = await request(app)
            .post("/jobs/upload")
            .attach("wrong-field-name", IMAGE_PATH);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Upload error: Unexpected field");
    });

    it("should successfully upload a valid image", async () => {
        const response = await request(app)
            .post("/jobs/upload")
            .attach("image", IMAGE_PATH);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("jobId");
        expect(typeof response.body.jobId).toBe("string");
    });
});
