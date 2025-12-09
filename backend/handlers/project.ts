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

        // Parse JSON fields
        const projectData = {
            ...project,
            erdData: project.erdData ? JSON.parse(project.erdData) : null,
            canvasData: project.canvasData ? JSON.parse(project.canvasData) : null,
        };

        res.json({ project: projectData });
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
                ...(erdData !== undefined && { erdData: JSON.stringify(erdData) }),
                ...(canvasData !== undefined && { canvasData: JSON.stringify(canvasData) }),
            }
        });

        // Parse JSON fields for response
        const projectData = {
            ...updatedProject,
            erdData: updatedProject.erdData ? JSON.parse(updatedProject.erdData) : null,
            canvasData: updatedProject.canvasData ? JSON.parse(updatedProject.canvasData) : null,
        };

        res.json({ project: projectData });
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

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // Delete old messages
            await tx.chatMessage.deleteMany({
                where: { projectId }
            });

            // Insert new messages
            if (messages && messages.length > 0) {
                await tx.chatMessage.createMany({
                    data: messages.map((msg: any) => ({
                        id: randomUUID(),
                        projectId,
                        role: msg.role,
                        content: msg.content,
                        createdAt: new Date(msg.timestamp || Date.now())
                    }))
                });
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error saving messages:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

import * as fs from 'fs';
import * as path from 'path';

// ... existing imports

const getProjectCodeHandler = async (req: Request, res: Response) => {
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

        const ormType = project.ormType || 'prisma';
        const boilerplatePath = path.join(process.cwd(), 'templates', ormType);

        // Helper to recursively read directory
        const readDir = (dirPath: string, relativePath: string = ''): any[] => {
            if (!fs.existsSync(dirPath)) return [];

            const items = fs.readdirSync(dirPath);
            const nodes: any[] = [];

            for (const item of items) {
                const fullPath = path.join(dirPath, item);
                const itemRelativePath = path.join(relativePath, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    if (item === 'node_modules' || item === '.git') continue;

                    nodes.push({
                        id: itemRelativePath,
                        name: item,
                        type: 'folder',
                        children: readDir(fullPath, itemRelativePath)
                    });
                } else {
                    let content = '';
                    try {
                        // Inject generated schema based on ORM type
                        let isSchemaFile = false;
                        if (ormType === 'prisma' && item === 'schema.prisma' && relativePath.includes('prisma')) {
                            isSchemaFile = true;
                        } else if (ormType === 'drizzle' && item === 'schema.ts' && relativePath.includes('db')) {
                            isSchemaFile = true;
                        } else if (ormType === 'sql' && item === 'init.sql') {
                            isSchemaFile = true;
                        }

                        if (isSchemaFile) {
                            content = project.prismaSchema || fs.readFileSync(fullPath, 'utf-8');
                        } else {
                            // Only read text files, skip binaries/images for now to save bandwidth
                            // or limit size
                            if (stat.size < 100000) { // < 100KB
                                content = fs.readFileSync(fullPath, 'utf-8');
                            } else {
                                content = "// File too large to display";
                            }
                        }
                    } catch (e) {
                        content = "// Error reading file";
                    }

                    nodes.push({
                        id: itemRelativePath,
                        name: item,
                        type: 'file',
                        language: getLanguageFromExt(item),
                        content
                    });
                }
            }

            // Sort folders first, then files
            return nodes.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
        };

        const files = readDir(boilerplatePath);
        res.json({ files });

    } catch (error) {
        console.error("Error fetching project code:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

function getLanguageFromExt(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.ts': return 'typescript';
        case '.tsx': return 'typescript';
        case '.js': return 'javascript';
        case '.jsx': return 'javascript';
        case '.json': return 'json';
        case '.css': return 'css';
        case '.html': return 'html';
        case '.prisma': return 'prisma';
        case '.md': return 'markdown';
        default: return 'plaintext';
    }
}

export {
    getAllProjectsHandler,
    getProjectByIdHandler,
    newProjectHandler,
    deleteProjectHandler,
    updateProjectHandler,
    saveMessagesHandler,
    getProjectCodeHandler
};
