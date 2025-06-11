import "dotenv/config";
import { app } from "./app";
import { makeDirectories } from "./utils/fileStorage";
import { initDb } from "./db/database";

const startServer = async () => {
    initDb();
    makeDirectories().catch(console.error);

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server listening at http://localhost:${PORT}`);
    });
};

startServer().catch(console.error);
