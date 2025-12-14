import { Router } from "express";
import { generateErdHandler } from "../handlers/erd-gen";
import { authMiddleware } from "../middleware/auth";
import { rateLimitMiddleware } from "../middleware/rateLimiter";
const router = Router();
router.post("/generate", authMiddleware, rateLimitMiddleware, generateErdHandler);
export default router;
