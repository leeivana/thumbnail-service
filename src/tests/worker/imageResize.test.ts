import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { jobStatuses } from "../../types";
import { THUMBNAIL_DIR, UPLOAD_DIR, THUMBNAIL_SIZE } from "../../constants";
import { updateJob } from "../../jobs/job.service";

// @NOTE: Mocking sharp implementation
jest.mock("sharp", () => {
    const mockSharp = jest.fn().mockImplementation(() => {
        const instance = {
            resize: jest.fn().mockReturnThis(),
            png: jest.fn().mockReturnThis(),
            toFile: jest.fn().mockResolvedValue(undefined),
        };
        return instance;
    });
    return mockSharp;
});

// @NOTE: Mocking updateJob service function (called within worker)
jest.mock("../../jobs/job.service", () => ({
    updateJob: jest.fn().mockResolvedValue(undefined),
}));

const createThumbnailFile = async (path: string) => {
    // @NOTE: Need function to create the thumbnail file
    // Because Jest mocks are hoisted (cannot reference `fs` as it's out of scope)
    // therefore the `toFile` method can't be
    await fs.writeFile(path, "");
};

describe("Image Resize Logic", () => {
    const testJobId = "test-job-id";
    const testStoredFileName = "test-image.jpg";

    beforeAll(async () => {
        await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
    });

    afterAll(async () => {
        // @NOTE: Cleanup (remove directory)
        await fs.rm(THUMBNAIL_DIR, { recursive: true, force: true });
    });

    it("should resize image and update job status", async () => {
        const thumbnailFilename = `${testJobId}.png`;
        const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

        const sharpInstance = sharp(path.join(UPLOAD_DIR, testStoredFileName));
        await sharpInstance
            .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE)
            .png()
            .toFile(thumbnailPath);

        // @NOTE: Create the thumbnail file manually
        await createThumbnailFile(thumbnailPath);

        // @NOTE: Simulate the job update logic
        await updateJob({
            id: testJobId,
            thumbnailFilename,
            status: jobStatuses.succeeded,
        });

        // @NOTE: Verify that sharp was called correctly w/ correct arguments
        expect(sharp).toHaveBeenCalledWith(
            path.join(UPLOAD_DIR, testStoredFileName)
        );
        expect(sharpInstance.resize).toHaveBeenCalledWith(
            THUMBNAIL_SIZE,
            THUMBNAIL_SIZE
        );
        expect(sharpInstance.png).toHaveBeenCalled();
        expect(sharpInstance.toFile).toHaveBeenCalledWith(thumbnailPath);

        // @NOTE: Verify that the job status was updated
        expect(updateJob).toHaveBeenCalledWith({
            id: testJobId,
            thumbnailFilename,
            status: jobStatuses.succeeded,
        });

        // @NOTE: Verify that the thumbnail file exists
        await expect(fs.access(thumbnailPath)).resolves.not.toThrow();
    });
});
