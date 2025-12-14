import { streamText } from "ai";
import { googleAi } from "../lib/google-ai";
import { prisma } from "../lib/db";
const generatePrismaHandler = async (req, res) => {
    if (!req.body || !req.query) {
        return res.status(400).json({ error: "Invalid request body or query" });
    }
    const projectId = req.query.projectId;
    if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
    }
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });
    if (!project) {
        return res.status(404).json({ error: "Could not find project" });
    }
    const image = req.body.image || "";
    const prompt = req.body.prompt || "";
    const history = req.body.history || [];
    const ormType = req.body.ormType || "prisma";
    let systemPrompt = "";
    if (ormType === "drizzle") {
        systemPrompt = `Generate Drizzle ORM schema (TypeScript) for the database${image ? " represented in the image" : ""}.
${image ? "The image is a diagram of the database structure." : ""}
Do not include any explanations or additional text, just the Drizzle schema code.
Do not use markdown formatting.
Use 'pg-core' for PostgreSQL types.
Export the tables consts.`;
    }
    else if (ormType === "sql") {
        systemPrompt = `Generate raw PostgreSQL SQL schema for the database${image ? " represented in the image" : ""}.
${image ? "The image is a diagram of the database structure." : ""}
Do not include any explanations or additional text, just the SQL code.
Do not use markdown formatting.`;
    }
    else {
        // Default Prisma
        systemPrompt = `Generate Prisma v7 schema for the database${image ? " represented in the image" : ""}.
${image ? "The image is a diagram of the database structure." : ""}
Do not include any explanations or additional text, just the Prisma schema.
Do not use markdown formatting.`;
    }
    const instructions = `
${systemPrompt}

Use the following requirements to guide the schema generation:
${prompt}
`;
    const contentParts = [{
            type: "text",
            text: instructions,
        }];
    if (image) {
        contentParts.push({
            type: "image",
            image: "data:image/png;base64," + image,
        });
    }
    const result = streamText({
        model: googleAi("gemini-2.0-flash"),
        messages: [
            ...history,
            {
                role: "user",
                content: contentParts,
            },
        ],
        onFinish: async ({ text }) => {
            console.log("Generation finished:", text);
            await prisma.project.update({
                where: { id: projectId },
                data: {
                    prismaSchema: text,
                    ormType: ormType,
                    lastGeneratedAt: new Date()
                },
            });
        },
    });
    result.pipeUIMessageStreamToResponse(res);
};
export { generatePrismaHandler };
