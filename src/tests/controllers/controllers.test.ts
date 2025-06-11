import request from "supertest";
import { app } from "../../app";
import path from "path";
import fs from "fs/promises";
import { makeDirectories } from "../../utils/fileStorage";
import { IMAGE_PATH, THUMBNAIL_PATH, UPLOAD_PATH } from "../constants";

beforeAll(async () => {
    await makeDirectories();
});

afterAll(async () => {
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
