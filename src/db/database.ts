import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { join } from "path";
import { Schema } from "../types";

const dbFile = join(__dirname, "../../db.json");
export const db = new Low<Schema>(new JSONFile<Schema>(dbFile), { jobs: [] });

export const initDb = async () => {
    // @NOTE: Ensuring database is initialized
    await db.read();
    if (!db.data) {
        db.data = { jobs: [] };
        await db.write();
    }
};
