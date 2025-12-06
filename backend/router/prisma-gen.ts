import { Router } from "express";
import { generatePrismaHandler } from "../handlers/prisma-gen";

const router = Router();

router.post("/generate", generatePrismaHandler);

export default router;