import { Router } from "express";
import { getAllProjectsHandler, getProjectByIdHandler, newProjectHandler, deleteProjectHandler, updateProjectHandler, saveMessagesHandler, getProjectCodeHandler } from "../handlers/project";
import { authMiddleware } from "../middleware/auth";
const router = Router();
router.use(authMiddleware);
router.get("/", getAllProjectsHandler);
router.post("/", newProjectHandler);
router.post("/:projectId/messages", saveMessagesHandler); // Must come before /:projectId
router.get("/:projectId/code", getProjectCodeHandler); // New route for code
router.get("/:projectId", getProjectByIdHandler);
router.delete("/:projectId", deleteProjectHandler);
router.put("/:projectId", updateProjectHandler);
export default router;
