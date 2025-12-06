import { streamText } from "ai";
import { googleAi } from "../lib/google-ai";

const generatePrismaHandler = (
    req: Request & {
        body: {
            image: string;
            prompt: string;
            history: { content: string; role: "user" | "assistant" }[];
        };
    },
    res: Response
) => {
    if (!req.body) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const image = req.body.image || "";
    const prompt = req.body.prompt || "";
    const history = req.body.history || [];

    if (!image) {
        return res.status(400).json({ error: "Image is required" });
    }

    const instructions = `
Generate Prisma v7 schema for the database represented in the image.
The image is a diagram of the database structure.
Do not include any explanations or additional text, just the Prisma schema.
Do not use markdown formatting.

Use the following requirements to guide the schema generation:
${prompt}
`

    const result = streamText({
        model: googleAi("gemini-2.5-flash"),
        messages: [
            ...history,
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: instructions,
                    },
                    {
                        type: "image",
                        image: "data:image/png;base64," + image,
                    },
                ],
            },
        ],
    });

    result.pipeUIMessageStreamToResponse(res);
};


export { generatePrismaHandler };