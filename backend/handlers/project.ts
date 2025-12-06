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

export { getAllProjectsHandler, getProjectByIdHandler, newProjectHandler };
