import express from "express";

import dotenv from "dotenv";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import erdGenRouter from "./router/erd-gen";
import prismaGenRouter from "./router/prisma-gen";
import projectRouter from "./router/project";

dotenv.config();

import cors from "cors";

const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options(/.*/, cors()); // Enable pre-flight for all routes

// Mount Better Auth handler BEFORE express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express.json() AFTER Better Auth handler
app.use(express.json({ limit: "1000mb" }));

const port = process.env.PORT || 3001;

app.use("/erd", erdGenRouter);
app.use("/prisma", prismaGenRouter);
app.use("/project", projectRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Error occurred:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});