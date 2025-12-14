import { Router } from "express";
import { generatePrismaHandler } from "../handlers/prisma-gen";
import { authMiddleware } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
const router = Router();
router.post("/generate", authMiddleware, rateLimitMiddleware, generatePrismaHandler);
export default router;
