import { Router } from "express";
import { generatePrismaHandler } from "../handlers/prisma-gen.js";
import { authMiddleware } from "../middleware/auth.js";
import { rateLimitMiddleware } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/generate", authMiddleware, rateLimitMiddleware, generatePrismaHandler);

export default router;