// Load environment variables FIRST, before any other imports
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import erdGenRouter from "./router/erd-gen.js";
import prismaGenRouter from "./router/prisma-gen.js";
import projectRouter from "./router/project.js";
import paymentRouter from "./router/payment.js";

const app = express();

// CORS configuration - allow requests from frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3060'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Mount Better Auth handler BEFORE express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

// Mount express.json() AFTER Better Auth handler
app.use(express.json({ limit: "1000mb" }));

const port = process.env.PORT || 3001;

app.use("/erd", erdGenRouter);
app.use("/prisma", prismaGenRouter);
app.use("/project", projectRouter);
app.use("/payment", paymentRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Error occurred:", err);
    console.error("Stack trace:", err.stack);
    res.status(500).json({ error: err.message || "Internal server error" });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});