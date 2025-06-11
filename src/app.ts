import express from "express";
import { jobRouter } from "./jobs/job.controller";
import { errorHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(express.json());
app.use("/jobs", jobRouter);
app.get("/health", (_req, res) => res.send("pong"));

app.use(errorHandler);
