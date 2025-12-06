import { streamText } from 'ai';
import { googleAi } from '../lib/google-ai';
import { prisma } from '../lib/db';

const generateErdHandler = async (
    req: Request & {
        query: { projectId: string };
        body: { requirements: string };
    },
    res: Response
) => {
    if (!req.body || !req.query) {
        return res.status(400).json({ error: "Invalid request body or query" });
    }

    const requirements = req.body.requirements || "";
    const projectId = req.query.projectId;

    if (!requirements) {
        return res.status(400).json({ error: "Requirements are required" });
    }

    if (!projectId) {
        return res.status(400).json({ error: "Project ID is required" });
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        return res.status(404).json({ error: "Could not find project" });
    }

    const prompt = `Generate mermaid code for an ERD based on the following requirements
Only output the mermaid code without any explanation or additional text.
Do not use markdown formatting.
Give code that is ready to be rendered by mermaid.

<requirements>
${requirements}
</requirements>`;

    const result = streamText({
        model: googleAi("gemini-2.5-flash"),
        prompt: prompt,
    });

    result.pipeUIMessageStreamToResponse(res);
};

export { generateErdHandler };