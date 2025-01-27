const express = require('express');
const https = require('https');  // Import the https module
const ytdl = require('@distube/ytdl-core');
const { createProxyAgent } = require('@distube/ytdl-core');  // Import createProxyAgent from distube's ytdl-core
const gTTS = require('gtts');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const getMP3Duration = require('get-mp3-duration'); // Added this import
const { PassThrough } = require('stream'); // Use require for consistency
const textToSpeech = require('@google-cloud/text-to-speech');
const fsp = require('fs').promises;


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

async function generateSpeech(text) {
    const client = new textToSpeech.v1beta1.TextToSpeechClient({
        credentials: {
            client_email: 'quickvid@quickvid-448819.iam.gserviceaccount.com',
            private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDe78lnqUm9EnDl\niDTaQ0azPCruq7Consb6wUgvEsyASb0Q3++r2cd6gIOfILUsdMO3tUe198KZ9asu\nnqjaGDnwsYX31LoanlHWD4RI7IGyHWwT2ifeLnrq83mprSYFKooPJXeqF8JJkGT9\nN/IUEhR5bNCjQp73EbmgX92/gMQoHDWobnZXakciDsaVUN+CLk1k1wL3VAtNhonf\nMO/0MuflHTNlPIsTvyH/QCxCndndHDS+cHY0h6VqZ6LydgEmoNCJ6FWVBDin8xos\ndvIF8aCwstbP/eDRg5jJm2ewOxNDQcfBNwJ36XhoQfOsHY6MtP7jIylCwK4xLxTY\n46bMUW9JAgMBAAECggEASBxa0s+E3QYOg4hDxEfXohk3r9zUNy6ooSqM3UEg6eww\nHjm5Liay6fKQ4JN1Vuxr9EvMZtU92owG83z5lBYbA7qAYXIrQnnscaeyO95Yc1Mm\nBuPdWnZBZycbNuGddzVT0+NkKh4mR6JPsEJ86LYSblZexDhD8BoJJ5Fqyktt56Th\nsDpTUmWa68QVx23Dco/3cpG+U6NmFBCVO3mykhwgMeg5I2dYFgwt7d67M6lQvn4l\noPRPfAsHa50+ox5qJr11h30Tm9v3Qy66MsNgGOV0VJWl7iClHw7D7WZ7AMeT80ml\nDhHwLA3jwcHo5pEbXs8adufj2xSI1vLKrViJVjjeowKBgQD1s5VjG/T7ItKkMAKf\nWsLg/Hwqb+Umn0Zu664o8Hk22HzLYaSpj+9RqzCaQ63E0BUCTRx2QuUtSLxmlxU+\nHNJWc+FHyxsrThs1o7ax06dQPg9rYLVF9IC87tgM+g9Ayewu0Xh6fOCK0SqBm6mE\nQRQ9I0uVjNst42mQeYQ+lDvcrwKBgQDoR+7S8PXQuTK7fkE9ZxZJBgh8jRaVINjF\nRmdSQcVp/egSnWElJMSTuQRYMBH1HH/Luez6NZsoUT3YajgaiRPeyP3L0pMANcoi\nF+ch1t2nnsuzOBZ9wDqGWia+YWNrNf7hE+/lcgc4uKZRlEjOxzxKYwmLsTTG9mwB\nfmNdreqhhwKBgECJQQ3dRAXK6cUSjz3IGzP5XavP5EK2x0tPQFmkgFI1nuHU7elT\n0yqCaqu6ZyQw+7O1CWrOu1+foUzZFk1QSLdIjL3MzYAcbe0y6UPgMixTgL1Vk4ei\nZ0Y4/iq6a9M6tny9rIWP03Li6eVNO8NvTJ+aa7oGW3O8Lfgy0teVG/wlAoGBAKE5\ntKJD0Et1EKqlQsFM+WHsRx20jHUsXGnpqTOmJVGhhGDPTiuK7sseQ862ZvB8PJP6\n1GsDpFOCuGurpo98kAc1+TttSM1/iHLLpomNa0K6bOdTygC02aqBjpzcWjaDPwuZ\nXA0lba/IMuEzDKpCDi4PugN1F432YxdSU8QlQFOnAoGAI//wNo3LGdVXfyGVnWYp\n9bGYQwQtRK3+gnxRDWjpC/fdpI3nF2kRVG9KPLzbN2HOVnoiFdQXSHxBiuS0SPFH\nU1K97+NbhClB3COdPjdW1fEXUyZnvOBnZHAciWTRtysoUayESMm4ZC8ybtMDaDsZ\nCtuiydA9LtWJCeaDj5XR3+8=\n-----END PRIVATE KEY-----\n'
        }
    });

    // Add a mark at the end of each word
    const ssmlText = text.split(' ')
        .map((word, index) => `${word} <mark name="word_${index}"/>`)
        .join(' ');
    console.log(ssmlText);

    const request = {
        input: {
            ssml: ssmlText
        },
        voice: { languageCode: 'en-US' },
        audioConfig: {
            audioEncoding: 'MP3',
        },
        enableTimePointing: ['SSML_MARK']
    };

    try {
        const [response] = await client.synthesizeSpeech(request);

        await fsp.writeFile('output.mp3', response.audioContent);

        // Print timepoints with words
        response.timepoints.forEach(point => {
            const wordIndex = point.markName.split('_')[1];
            const word = text.split(' ')[wordIndex];
            console.log(`Word: ${word}, Time: ${point.timeSeconds} seconds`);
        });
        const timePoints = response.timepoints.map(point => point.timeSeconds);
        console.log(timePoints);
        return {
            audioPath: 'output.mp3',
            timepoints: response.timepoints
        };
    } catch (error) {
        console.error('TTS Error:', error);
    }
}
async function processRedditStory(req, res) {
    try {
        console.log("REDDIT STORY SUCCESS");
        generateSpeech('Hello world, how are you today?')
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