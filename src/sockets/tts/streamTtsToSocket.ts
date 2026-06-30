import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { Socket } from "socket.io";

// Lazily initialise the client so importing this module never crashes server
// boot when TTS is disabled / the key is absent. The key is only required at
// the moment TTS is actually used.
let elevenlabs: ElevenLabsClient | null = null;

function getClient(): ElevenLabsClient {
    if (!elevenlabs) {
        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            throw new Error("Missing ELEVENLABS_API_KEY in environment variables");
        }
        elevenlabs = new ElevenLabsClient({ apiKey });
    }
    return elevenlabs;
}


//Streams ElevenLabs PCM audio directly to a socket

export async function streamTtsToSocket(
    socket: Socket,
    text: string
) {
    const audioStream = await getClient().textToSpeech.stream(
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
