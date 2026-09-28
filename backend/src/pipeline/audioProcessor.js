const axios = require('axios');
const speech = require('@google-cloud/speech');

let speechClient;
let isMockMode = false;
try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS === './service-account.json') {
        throw new Error("No real GCP credentials");
    }
    speechClient = new speech.SpeechClient();
} catch (e) {
    console.log("⚠️  Google Cloud Speech-to-Text not configured, using mock audio processing.");
    isMockMode = true;
}

async function downloadTelegramFile(fileId, botToken) {
    try {
        const fileRes = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
        const filePath = fileRes.data.result.file_path;
        const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
        const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error("Error downloading file from Telegram:", error.message);
        throw error;
    }
}

async function transcribeAudio(audioBuffer, languageCode) {
    if (isMockMode) {
        return "Mock transcription of a critical infrastructure voice report.";
    }

    try {
        const audio = {
            content: audioBuffer.toString('base64'),
        };
        const config = {
            encoding: 'OGG_OPUS',
            sampleRateHertz: 48000,
            languageCode: languageCode,
            enableAutomaticPunctuation: true,
        };
        const request = {
            audio: audio,
            config: config,
        };

        const [response] = await speechClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        return transcription || "No speech recognized.";
    } catch (error) {
        console.error("Error transcribing audio:", error.message);
        throw error;
    }
}

module.exports = {
    downloadTelegramFile,
    transcribeAudio
};
