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
async function processRedditStory(req, res) {
    try {
        console.log("REDDIT STORY SUCCESS");
        res.send("reddit success");
    }
}
module.exports = {
    processRedditStory
};