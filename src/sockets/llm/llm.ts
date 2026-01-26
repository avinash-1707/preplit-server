import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

export async function streamGemini({
    prompt,
    onToken,
    signal,
}: {
    prompt: string;
    onToken: (token: string) => void;
    signal?: AbortSignal;
}) {
    // Early abort check
    if (signal?.aborted) {
        throw new Error("Aborted before Gemini request started");
    }

    const result = await genAI.models.generateContentStream({
        model: "gemini-3-flash-preview",
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
            console.log(text)
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
