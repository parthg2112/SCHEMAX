import { Request, Response } from "express";
import { prisma } from "../lib/db.js";
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
        await prisma.$transaction(async (tx: any) => {
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

import * as path from 'path';

// Schema handler - returns just the generated schema content
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
        const schemaContent = project.prismaSchema || getDefaultSchema(ormType);

        // Return schema info based on ORM type
        const schemaInfo = getSchemaInfo(ormType, schemaContent);

        res.json({
            schema: schemaInfo,
            ormType,
            projectName: project.name
        });

    } catch (error) {
        console.error("Error fetching project schema:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get schema file info based on ORM type
function getSchemaInfo(ormType: string, content: string) {
    switch (ormType) {
        case 'prisma':
            return {
                filename: 'schema.prisma',
                language: 'prisma',
                content,
                downloadName: 'schema.prisma'
            };
        case 'drizzle':
            return {
                filename: 'schema.ts',
                language: 'typescript',
                content: convertToDrizzleSchema(content),
                downloadName: 'schema.ts'
            };
        case 'sql':
            return {
                filename: 'schema.sql',
                language: 'sql',
                content: convertToSqlSchema(content),
                downloadName: 'schema.sql'
            };
        default:
            return {
                filename: 'schema.prisma',
                language: 'prisma',
                content,
                downloadName: 'schema.prisma'
            };
    }
}

// Default schema templates
function getDefaultSchema(ormType: string): string {
    switch (ormType) {
        case 'prisma':
            return `generator client {
  provider = "prisma-client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Define your models here
`;
        case 'drizzle':
            return `import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define your schema here
`;
        case 'sql':
            return `-- PostgreSQL Schema
-- Define your tables here
`;
        default:
            return '';
    }
}

// Convert Prisma schema to Drizzle format (basic conversion)
function convertToDrizzleSchema(prismaSchema: string): string {
    // If already in Drizzle format, return as-is
    if (prismaSchema.includes('drizzle-orm')) {
        return prismaSchema;
    }

    // For now, return the Prisma schema with a note
    // TODO: Implement proper Prisma -> Drizzle conversion
    return `import { pgTable, serial, text, timestamp, integer, boolean, varchar } from 'drizzle-orm/pg-core';

// Converted from Prisma schema
// Note: Manual adjustments may be needed

${prismaSchema}
`;
}

// Convert Prisma schema to SQL DDL (basic conversion)
function convertToSqlSchema(prismaSchema: string): string {
    // If already in SQL format, return as-is
    if (prismaSchema.includes('CREATE TABLE')) {
        return prismaSchema;
    }

    // For now, return the Prisma schema with a note
    // TODO: Implement proper Prisma -> SQL conversion
    return `-- PostgreSQL Schema
-- Converted from Prisma schema
-- Note: Manual adjustments may be needed

${prismaSchema}
`;
}

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
