import { streamText } from 'ai';
import { googleAi } from '../lib/google-ai';
import { prisma } from '../lib/db';
import { Request, Response } from 'express';

const generateErdHandler = async (
    req: Request,
    res: Response
) => {
    if (!req.body || !req.query) {
        return res.status(400).json({ error: "Invalid request body or query" });
    }

    const requirements = req.body.requirements || "";
    const projectId = req.query.projectId as string;

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
        return res.status(404).json({ error: "Project not found" });
    }

    console.log("Generating ERD for project:", projectId);
    console.log("Requirements:", requirements);

    const instructions = `Generate mermaid code for an ERD based on the following requirements:

Only output the mermaid code without any explanation or additional text.
Do not use markdown formatting.
Give code that is ready to be rendered by mermaid.

${requirements}
`;

    try {
        const result = streamText({
            model: googleAi('gemini-2.0-flash'),
            messages: [{ role: 'user', content: instructions }],
        });

        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' });

        let hasContent = false;
        for await (const delta of result.textStream) {
            hasContent = true;
            process.stdout.write(`Delta: ${delta} `); // Log chunks to stdout
            res.write(`data: ${JSON.stringify({ type: 'text-delta', delta })}\n\n`);
        }
        console.log("\nStream finished. Has content:", hasContent);

        res.write(`data: [DONE]\n\n`);
        res.end();
    } catch (error: any) {
        console.error("Error generating ERD:", error);

        let errorMessage = 'Failed to generate ERD';

        // Check for quota exceeded error
        if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota')) {
            errorMessage = 'AI Quota Exceeded. Please try again later or check your API key limits.';
            console.error("Quota exceeded detected");
        }

        res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
        res.end();
    }
};

export { generateErdHandler };