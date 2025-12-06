import { Router } from "express";
import { getAllProjectsHandler, getProjectByIdHandler, newProjectHandler } from "../handlers/project";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getAllProjectsHandler);
router.get("/:projectId", getProjectByIdHandler)
router.post("/", newProjectHandler)

export default router;