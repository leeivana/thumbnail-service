import { Low, JSONFile } from "lowdb";
import { join, dirname } from "path";
import { Schema } from "../types";
import { mkdir } from "fs/promises";

const dbDir = join(__dirname, "../../data");
const dbFile = join(dbDir, "db.json");

const verifyCreateDatabaseFile = async () => {
    try {
        await mkdir(dbDir, { recursive: true });

        try {
            await db.read();
        } catch (error) {
            db.data = { jobs: [] };
            await db.write();
        }
    } catch (error) {
        console.error("Failed to initialize database:", error);
        throw error;
    }
};

export const db = new Low<Schema>(new JSONFile<Schema>(dbFile));

export const initDb = async () => {
    await verifyCreateDatabaseFile();
    console.log("Database initialized successfully");
};
