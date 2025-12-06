import { streamText } from 'ai';
import { googleAi } from '../lib/google-ai';

const generateErd = (
    req: Request & { body: { requirements: string } },
    res: Response
) => {
    if (!req.body) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const requirements = req.body.requirements || "";

    if (!requirements) {
        return res.status(400).json({ error: "Requirements are required" });
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

export { generateErd };