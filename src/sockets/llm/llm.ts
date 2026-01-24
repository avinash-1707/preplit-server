import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI(
    { apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY! }
);

export async function streamGemini({
    prompt,
    onToken,
    signal,
}: {
    prompt: string;
    onToken: (text: string) => void;
    signal?: AbortSignal;
}) {

    const result = await genAI.models.generateContentStream(
        {
            model: "gemini-3-flash-preview",
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        },
    );

    for await (const chunk of result) {
        console.log(chunk.text)
        if (chunk) {
            onToken(chunk.text!);
        }
    }
}
