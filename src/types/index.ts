export type JobData = {
    id: string;
    status: JobStatuses;
    originalFilename: string;
    storedFilename: string;
    thumbnailFilename?: string;
    error?: string;
};

export const jobStatuses = {
    processing: "processing",
    succeeded: "succeeded",
    failed: "failed",
} as const;

export type JobStatuses = (typeof jobStatuses)[keyof typeof jobStatuses];

export type Schema = {
    jobs: JobData[];
};
