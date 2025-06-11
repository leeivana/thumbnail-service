import request from "supertest";
import { app } from "../../app";
import path from "path";
import fs from "fs/promises";
import { makeDirectories } from "../../utils/fileStorage";
import { IMAGE_PATH, THUMBNAIL_PATH, UPLOAD_PATH } from "../constants";
import { initDb } from "../../db/database";

beforeEach(async () => {
    // @NOTE: Removing and re-creating directories to remove stale test data
    await fs.rm(UPLOAD_PATH, { recursive: true, force: true });
    await fs.rm(THUMBNAIL_PATH, { recursive: true, force: true });
    await makeDirectories();
    await initDb();
    try {
        await fs.access(IMAGE_PATH);
    } catch (error) {
        throw new Error(`Test image not found at ${IMAGE_PATH}`);
    }
});

afterAll(async () => {
    // @NOTE: Clean up after all tests
    await fs.rm(UPLOAD_PATH, {
        recursive: true,
        force: true,
    });
    await fs.rm(THUMBNAIL_PATH, {
        recursive: true,
        force: true,
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
