import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { Socket } from "socket.io";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
    throw new Error("Missing ELEVENLABS_API_KEY in environment variables");
}

const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});


//Streams ElevenLabs PCM audio directly to a socket

export async function streamTtsToSocket(
    socket: Socket,
    text: string
) {
    const audioStream = await elevenlabs.textToSpeech.stream(
        "JBFqnCBsd6RMkjVDRZzb",
        {
            modelId: "eleven_multilingual_v2",
            text,
            outputFormat: "mp3_44100_128",
            voiceSettings: {
                stability: 0,
                similarityBoost: 1.0,
                useSpeakerBoost: true,
                speed: 1.0,
            },
        }
    );

    try {
        for await (const chunk of audioStream) {
            // IMPORTANT: send raw PCM bytes
            socket.emit("tts:chunk", chunk);
        }

        socket.emit("tts:end");
    } catch (err) {
        console.error("TTS stream error:", err);
        socket.emit("tts:error", "TTS_STREAM_FAILED");
    }
}
