import {
    createJob,
    updateJob,
    getJobById,
    getJobs,
} from "../../../src/jobs/job.service";
import * as dbModels from "../../../src/db/models";
import { jobStatuses } from "../../../src/types";

jest.mock("../../../src/db/models");

const mockedDbModels = dbModels as jest.Mocked<typeof dbModels>;

describe("Job Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createJob", () => {
        it("should create a job and return job id", async () => {
            mockedDbModels.addJob.mockResolvedValueOnce(undefined);

            const jobId = await createJob("original.jpg", "stored.jpg");
            expect(jobId).toBeDefined();
            expect(mockedDbModels.addJob).toHaveBeenCalledTimes(1);
        });

        it("should return HttpError if filenames are missing", async () => {
            const result = await createJob("", "");
            expect(result).toHaveProperty("statusCode", 400);
        });
    });

    describe("updateJob", () => {
        it("should update a job and return updated job", async () => {
            const mockJob = { id: "abc123", status: jobStatuses.succeeded };
            mockedDbModels.updateJobById.mockResolvedValueOnce(mockJob as any);

            const updated = await updateJob({
                id: "abc123",
                status: jobStatuses.succeeded,
            });
            expect(updated).toEqual(mockJob);
        });

        it("should return HttpError if id/status are missing", async () => {
            const result = await updateJob({ id: "", status: "" as any });
            expect(result).toHaveProperty("statusCode", 400);
        });
    });

    describe("getJobById", () => {
        it("should call findJobById", async () => {
            const job = { id: "abc123" };
            mockedDbModels.findJobById.mockResolvedValueOnce(job as any);

            const result = await getJobById("abc123");
            expect(result).toEqual(job);
        });
    });

    describe("getJobs", () => {
        it("should call getAllJobs", async () => {
            const jobs = [{ id: "abc123" }];
            mockedDbModels.getAllJobs.mockResolvedValueOnce(jobs as any);

            const result = await getJobs();
            expect(result).toEqual(jobs);
        });
    });
});
