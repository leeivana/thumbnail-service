import request from "supertest";
import { app } from "../../app";
import path from "path";
import fs from "fs/promises";
import { IMAGE_PATH, THUMBNAIL_PATH, UPLOAD_PATH } from "../constants";
import { initDb } from "../../db/database";

// @NOTE: Mocking createJob tries to add a job to the thumbnailQueue
// Therefore mocking worker
jest.mock("../../worker/worker", () => ({
    thumbnailQueue: {
        add: jest.fn().mockResolvedValue({ id: "test-queue-id" }),
    },
}));

// @NOTE: Mocking out db calls
jest.mock("../../db/models", () => ({
    getAllJobs: jest.fn().mockResolvedValue([
        {
            id: "Imjog7KcuFLRB3j8bV4Sp",
            status: "processing",
            originalFilename: "stitch.jpg",
            storedFilename: "image-6GIyl89mTfkSUEzQvkxMB.jpg",
        },
    ]),
    addJob: jest.fn(),
    findJobById: jest.fn(),
}));

beforeEach(async () => {
    // @NOTE: Removing and re-creating directories to remove stale test data
    await fs.rm(UPLOAD_PATH, { recursive: true, force: true });
    await fs.rm(THUMBNAIL_PATH, { recursive: true, force: true });
    await fs.mkdir(UPLOAD_PATH, { recursive: true });
    await fs.mkdir(THUMBNAIL_PATH, { recursive: true });
    await initDb();
    try {
        await fs.access(IMAGE_PATH);
    } catch (error) {
        throw new Error(
            "Test image not found. Please ensure the test image exists at the specified path."
        );
    }
});

afterEach(async () => {
    // @NOTE: Cleanup after each test
    await fs.rm(UPLOAD_PATH, {
        recursive: true,
        force: true,
    });
    await fs.rm(THUMBNAIL_PATH, {
        recursive: true,
        force: true,
    });
});

describe("GET /jobs", () => {
    it("should return a list of jobs", async () => {
        const response = await request(app).get("/jobs");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("jobs");
        const { jobs } = response.body;
        expect(Array.isArray(jobs)).toBe(true);
        expect(jobs.length).toEqual(1);
    });
});

describe("POST /jobs/upload", () => {
    it("should upload an image file and return jobId", async () => {
        const response = await request(app)
            .post("/jobs/upload")
            .attach("image", IMAGE_PATH);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("jobId");
    });

    it("should return 400 if no file is uploaded", async () => {
        const response = await request(app).post("/jobs/upload");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Image file is required");
    });
});
