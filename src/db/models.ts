import { db } from "./database";
import { JobData } from "../types";

export const addJob = async (job: JobData) => {
    await db.read();
    db.data.jobs.push(job);
    await db.write();
};

export const findJobById = async (id: string): Promise<JobData | undefined> => {
    await db.read();
    return db.data.jobs.find((job) => job.id === id);
};

export const getAllJobs = async (): Promise<JobData[]> => {
    await db.read();
    return db.data.jobs;
};

export const updateJobById = async (
    id: string,
    changes: Partial<JobData>
): Promise<JobData | null> => {
    await db.read();
    const job = db.data.jobs.find((job) => job.id === id);
    if (!job) {
        return null;
    }

    Object.assign(job, changes);
    await db.write();

    return job;
};
