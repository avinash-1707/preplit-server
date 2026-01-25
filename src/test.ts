import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

if (!ELEVENLABS_API_KEY) {
    throw new Error('Missing ELEVENLABS_API_KEY in environment variables');
}

const elevenlabs = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});

export const createAudioStreamFromText = async (text: string): Promise<Buffer> => {
    const audioStream = await elevenlabs.textToSpeech.stream('JBFqnCBsd6RMkjVDRZzb', {
        modelId: 'eleven_multilingual_v2',
        text,
        outputFormat: "pcm_44100",
        // Optional voice settings that allow you to customize the output
        voiceSettings: {
            stability: 0,
            similarityBoost: 1.0,
            useSpeakerBoost: true,
            speed: 1.0,
        },
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
        chunks.push(Buffer.from(chunk));
    }

    const content = Buffer.concat(chunks);
    return content;
};

createAudioStreamFromText("Yo! What's up dude?")