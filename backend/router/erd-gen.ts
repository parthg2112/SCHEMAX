import { Router } from "express";
import { generateErdHandler } from "../handlers/erd-gen";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/generate", authMiddleware, generateErdHandler);

export default router;