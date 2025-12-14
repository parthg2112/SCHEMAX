import { Router } from "express";
import { generateErdHandler } from "../handlers/erd-gen.js";
import { authMiddleware } from "../middleware/auth.js";
import { rateLimitMiddleware } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/generate", authMiddleware, rateLimitMiddleware, generateErdHandler);

export default router;