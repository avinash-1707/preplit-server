import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const DEFAULT_MODEL = "gemini-3-flash-preview";

export async function streamGemini({
    prompt,
    onToken,
    signal,
    model = DEFAULT_MODEL,
}: {
    prompt: string;
    onToken: (token: string) => void;
    signal?: AbortSignal;
    model?: string;
}) {
    // Early abort check
    if (signal?.aborted) {
        throw new Error("Aborted before Gemini request started");
    }

    const result = await genAI.models.generateContentStream({
        model,
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
    });

    try {
        for await (const chunk of result) {
            if (signal?.aborted) {
                throw new Error("Gemini stream aborted");
            }

            const text = chunk.text;
            if (text) {
                onToken(text);
            }
        }
    } catch (err: any) {
        if (signal?.aborted) {
            console.log("Gemini stream cancelled");
            return;
        }
        throw err;
    }
}
