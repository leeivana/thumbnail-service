import { nanoid } from "nanoid";
import { addJob, findJobById, getAllJobs, updateJobById } from "../db/models";
import { JobData, JobStatuses, jobStatuses } from "../types";
import { HttpError } from "../errors/HttpError";

export const createJob = async (
    originalFilename: string,
    storedFilename: string
): Promise<string | HttpError> => {
    if (!originalFilename || !storedFilename) {
        throw new HttpError(400, "File names are required");
    }

    const job: JobData = {
        id: nanoid(),
        status: jobStatuses.processing,
        originalFilename,
        storedFilename,
    };
    await addJob(job);
    return job.id;
};

export const updateJob = async ({
    id,
    status,
    thumbnailFilename,
}: {
    id: string;
    status: JobStatuses;
    thumbnailFilename?: string;
}): Promise<JobData | null | HttpError> => {
    if (!status || !id) {
        throw new HttpError(400, "Job Id and Status are required");
    }
    return await updateJobById(id, {
        thumbnailFilename,
        status,
    });
};

export const getJobById = async (id: string) => {
    return await findJobById(id);
};

export const getJobs = async () => {
    return await getAllJobs();
};
