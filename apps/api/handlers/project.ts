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

// Convert Prisma schema to Drizzle format
function convertToDrizzleSchema(prismaSchema: string): string {
    const models: any[] = [];
    const lines = prismaSchema.split('\n');
    let currentModel: any = null;

    // Parse Prisma Schema
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('model ')) {
            const name = trimmed.split(' ')[1];
            currentModel = { name, fields: [] };
            models.push(currentModel);
        } else if (trimmed === '}') {
            currentModel = null;
        } else if (currentModel && trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@@')) {
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 2) {
                const [name, type] = parts;
                const isId = trimmed.includes('@id');
                const isUnique = trimmed.includes('@unique');
                const isDefault = trimmed.includes('@default');
                currentModel.fields.push({ name, type, isId, isUnique, isDefault });
            }
        }
    }

    // Generate Drizzle Schema
    let output = `import { pgTable, serial, text, integer, boolean, timestamp, varchar } from 'drizzle-orm/pg-core';\n\n`;

    for (const model of models) {
        output += `export const ${model.name.toLowerCase()} = pgTable('${model.name.toLowerCase()}', {\n`;

        for (const field of model.fields) {
            let drizzleField = '';

            // Map types
            switch (field.type) {
                case 'Int':
                    drizzleField = field.isId && field.isDefault ? 'serial' : 'integer';
                    break;
                case 'String':
                    drizzleField = 'text';
                    break;
                case 'Boolean':
                    drizzleField = 'boolean';
                    break;
                case 'DateTime':
                    drizzleField = 'timestamp';
                    break;
                default:
                    drizzleField = 'text'; // Fallback
            }

            output += `  ${field.name}: ${drizzleField}('${field.name}')`;

            if (field.isId && !field.isDefault) output += '.primaryKey()';
            if (field.isUnique) output += '.unique()';

            output += ',\n';
        }

        output += `});\n\n`;
    }

    return output;
}

// Convert Prisma schema to SQL DDL
function convertToSqlSchema(prismaSchema: string): string {
    const models: any[] = [];
    const lines = prismaSchema.split('\n');
    let currentModel: any = null;

    // Parse Prisma Schema (Reuse logic or duplicate for simplicity)
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('model ')) {
            const name = trimmed.split(' ')[1];
            currentModel = { name, fields: [] };
            models.push(currentModel);
        } else if (trimmed === '}') {
            currentModel = null;
        } else if (currentModel && trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('@@')) {
            const parts = trimmed.split(/\s+/);
            if (parts.length >= 2) {
                const [name, type] = parts;
                const isId = trimmed.includes('@id');
                const isUnique = trimmed.includes('@unique');
                currentModel.fields.push({ name, type, isId, isUnique });
            }
        }
    }

    let output = `-- PostgreSQL Schema\n\n`;

    for (const model of models) {
        output += `CREATE TABLE "${model.name}" (\n`;
        const fields: string[] = [];

        for (const field of model.fields) {
            let sqlType = '';
            switch (field.type) {
                case 'Int': sqlType = field.isId ? 'SERIAL' : 'INTEGER'; break;
                case 'String': sqlType = 'TEXT'; break;
                case 'Boolean': sqlType = 'BOOLEAN'; break;
                case 'DateTime': sqlType = 'TIMESTAMP'; break;
                default: sqlType = 'TEXT';
            }

            let line = `  "${field.name}" ${sqlType}`;
            if (field.isId) line += ' PRIMARY KEY';
            if (field.isUnique) line += ' UNIQUE';

            fields.push(line);
        }

        output += fields.join(',\n');
        output += `\n);\n\n`;
    }

    return output;
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
