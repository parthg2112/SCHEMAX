import { Router } from "express";
import { generatePrismaHandler } from "../handlers/prisma-gen";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/generate", authMiddleware, generatePrismaHandler);

export default router;