import { Router } from "express";
import { generateErdHandler } from "../handlers/erd-gen";

const router = Router();

router.post("/generate", generateErdHandler);

export default router;