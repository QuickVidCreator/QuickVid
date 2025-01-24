const express = require('express');
const https = require('https');  // Import the https module
const ytdl = require('@distube/ytdl-core');
const { createProxyAgent } = require('@distube/ytdl-core');  // Import createProxyAgent from distube's ytdl-core
const textToSpeech = require('@google-cloud/text-to-speech');
const gTTS = require('gtts');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const getMP3Duration = require('get-mp3-duration'); // Added this import
const { PassThrough } = require('stream'); // Use require for consistency
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs').promises;


const mime = require('mime-types');
const cors = require('cors');
const app = express();
app.use(cors()); // Enable CORS
//app.use((req, res, next) => {
//req.setTimeout(300000); // Set timeout to 5 minutes (300000 ms)
//res.setTimeout(300000); // Set timeout to 5 minutes (300000 ms)
//next();
//});
//const fontPath = path.join(__dirname, 'public', 'MyFont.ttf');
const fontPath = path.join(__dirname, 'public', 'MyFont.ttf').replace(/\\/g, '/');
const timerPath = path.join(__dirname, 'public', 'timer.mp3');
const cert = fs.readFileSync(path.join(__dirname, 'certificate.pem'));
const key = fs.readFileSync(path.join(__dirname, 'key.pem'));
const ttsClient = new textToSpeech.TextToSpeechClient();

async function textToSpeech(text) {
    const client = new textToSpeech.TextToSpeechClient();

    const request = {
        input: { text },
        voice: { languageCode: 'en-US' },
        audioConfig: {
            audioEncoding: 'MP3',
            enableWordTimeOffsets: true
        },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);

        // Save audio file
        await fs.writeFile('output.mp3', response.audioContent);

        // Extract word timings
        const wordTimings = response.timepoints.map(point => ({
            word: point.word,
            startTime: point.startTimeSeconds,
            endTime: point.endTimeSeconds
        }));

        return {
            audioPath: 'output.mp3',
            wordTimings
        };
    } catch (error) {
        console.error('TTS Error:', error);
    }
}
async function processRedditStory(req, res) {
    try {
        console.log("REDDIT STORY SUCCESS");
        textToSpeech('Hello world, how are you today?')
            .then(result => console.log(result.wordTimings));
        res.send("reddit success");
    }
    catch {
        res.send("FAILURE");
    }
}
module.exports = {
    processRedditStory
};