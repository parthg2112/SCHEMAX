import { streamText } from "ai";
import { googleAi } from "../lib/google-ai";
import { prisma } from "../lib/db";

const generatePrismaHandler = async (
    req: Request & {
        query: { projectId: string };
        body: {
            image?: string;
            prompt: string;
            history: { content: string; role: "user" | "assistant" }[];
        };
    },
    res: Response
) => {
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

    // Image is now optional - can work with text-only prompts
    const instructions = `
Generate Prisma v7 schema for the database${image ? " represented in the image" : ""}.
${image ? "The image is a diagram of the database structure." : ""}
Do not include any explanations or additional text, just the Prisma schema.
Do not use markdown formatting.

Use the following requirements to guide the schema generation:
${prompt}
`;

    const contentParts: any[] = [{
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
        model: googleAi("gemini-2.5-flash"),
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
                data: { prismaSchema: text },
            });
        },
    });

    result.pipeUIMessageStreamToResponse(res);
};


export { generatePrismaHandler };