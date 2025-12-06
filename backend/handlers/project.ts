import { Request, Response } from "express";
import { prisma } from "../lib/db";
import { randomUUID } from "crypto";

const getAllProjectsHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;

    try {
        const projects = await prisma.project.findMany({
            where: {
                ownerId: user.id
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json({ projects });
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getProjectByIdHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { projectId } = req.params;

    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                ownerId: user.id
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        res.json({ project });
    } catch (error) {
        console.error("Error fetching project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const newProjectHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { name } = req.body;

    if (!name) {
        res.status(400).json({ error: "Name is required" });
        return;
    }

    try {
        const project = await prisma.project.create({
            data: {
                id: randomUUID(),
                name,
                ownerId: user.id
            }
        });
        res.json({ project });
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteProjectHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { projectId } = req.params;

    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                ownerId: user.id
            }
        });

        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        await prisma.project.delete({
            where: {
                id: projectId
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateProjectHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { projectId } = req.params;
    const { name, erdData, canvasData } = req.body;

    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                ownerId: user.id
            }
        });

        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        const updatedProject = await prisma.project.update({
            where: {
                id: projectId
            },
            data: {
                ...(name && { name }),
                ...(erdData !== undefined && { erdData }),
                ...(canvasData !== undefined && { canvasData }),
            }
        });

        res.json({ project: updatedProject });
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const saveMessagesHandler = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { projectId } = req.params;
    const { messages } = req.body;

    try {
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                ownerId: user.id
            }
        });

        if (!project) {
            res.status(404).json({ error: "Project not found" });
            return;
        }

        // Delete old messages and insert new ones
        await prisma.$executeRaw`DELETE FROM chat_message WHERE "projectId" = ${projectId}`;

        if (messages && messages.length > 0) {
            const values = messages.map((msg: any) =>
                `('${randomUUID()}', '${projectId}', '${msg.role}', '${msg.content.replace(/'/g, "''")}', '${new Date(msg.timestamp || Date.now()).toISOString()}')`
            ).join(',');

            await prisma.$executeRawUnsafe(
                `INSERT INTO chat_message (id, "projectId", role, content, "createdAt") VALUES ${values}`
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error saving messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export {
    getAllProjectsHandler,
    getProjectByIdHandler,
    newProjectHandler,
    deleteProjectHandler,
    updateProjectHandler,
    saveMessagesHandler
};
