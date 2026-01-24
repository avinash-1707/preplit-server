import { streamText } from "ai";
import { google } from "@ai-sdk/google";

const result = await streamText({
    model: google("gemini-1.5-flash"),
    prompt: "Say hello one word at a time",
});

for await (const chunk of result.textStream) {
    console.log(chunk);
}