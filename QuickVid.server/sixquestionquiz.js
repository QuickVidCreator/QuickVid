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
const { Readable } = require('stream'); // Use require for consistency
const textToSpeech = require('@google-cloud/text-to-speech');
const fsp = require('fs').promises;
const logFile = fs.createWriteStream(`sixquestionquiz-output-${Date.now()}.log`, { flags: 'a' });

console.log = function (message) {
    logFile.write(`${new Date().toISOString()} - ${message}\n`);
    process.stdout.write(`${message}\n`);
};

console.error = function (message) {
    logFile.write(`${new Date().toISOString()} - ERROR: ${message}\n`);
    process.stderr.write(`${message}\n`);
};

const mime = require('mime-types');
const cors = require('cors');
const app = express();
app.use(express.json());  // Add this line
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

// Function to convert readable stream to buffer
const streamToBuffer = (readableStream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', chunk => chunks.push(chunk));
        readableStream.on('end', () => resolve(Buffer.concat(chunks)));
        readableStream.on('error', reject);
    });
};


// Function to process text into words, generate speech, and calculate durations
const processTextToWords = async (text) => {
    const words = text.split(' ');
    const durations = [];

    for (const word of words) {
        const gtts = new gTTS(word, 'en', 'us');
        const audioStream = gtts.stream();
        const audioBuffer = await streamToBuffer(audioStream);

        const duration = getMP3Duration(audioBuffer) / 2.5;
        durations.push({ word, duration });
    }
    durations.push({ word: '', duration: 250 });
    return durations;
};

// Function to process questions into words, generate speech, and calculate durations
//let questionDrift = 5500;
const processQuestionsToWords = async (text) => {
    const words = text.split(' ');
    const durations = [];

    for (const word of words) {
        const gtts = new gTTS(word, 'en', 'us');
        const audioStream = gtts.stream();
        const audioBuffer = await streamToBuffer(audioStream);

        const duration = getMP3Duration(audioBuffer) / 2.5;
        durations.push({ word, duration });
    }
    // Add an additional 5 seconds of duration
    durations.push({ word: '', duration: 5500 });
    //questionDrift += 50;

    return durations;
};
//let currentTime = 0;
//let timeline = 0;
const generateText = async (text, times) => {
    let words = text.split(' ');
    let adjustedWords = [];
    let adjustedTimes = [];

    let wordIndex = 0;
    let lastEndTime = 0;

    for (let i = 0; i < times.length; i++) {
        if (times[i] === "break") {
            // Insert a space with a fixed duration
            adjustedWords.push(" ");
            adjustedTimes.push(lastEndTime); // Space starts immediately after the last word
            lastEndTime += 5; // Space lasts for 5 seconds
        } else {
            if (wordIndex < words.length) {
                adjustedWords.push(words[wordIndex]);
                adjustedTimes.push(lastEndTime); // Start at the previous word’s end time
                lastEndTime = times[i]; // End time is taken from the original input
                wordIndex++;
            }
        }
    }

    // Generate the drawtext commands
    let drawTextCommands = "";
    adjustedWords.forEach((word, index) => {
        const startTime = adjustedTimes[index];
        const endTime = adjustedTimes[index + 1] ?? startTime + 1; // Default to +1 second

        console.log(`Word: '${word}', Start: ${startTime}, End: ${endTime}`);
        drawTextCommands += `drawtext=text='${word}':x=(w-text_w)/2:y=(h-text_h)/3:fontsize=100:fontcolor=white:borderw=3:bordercolor=black:fontfile='${fontPath}':enable='between(t,${startTime},${endTime})',`;
    });

    return drawTextCommands.slice(0, -1);
};


const generateAnswers = (text, times, location) => {
    let drawTextCommands = '';
    let startTime = times[0];
    let answerLocationY = location;
    drawTextCommands += `drawtext=text='${text}':x=${answerLocationX}:y=${answerLocationY}:fontsize=70:fontcolor=white:borderw=3:bordercolor=black:fontfile='${fontPath}':enable='between(t,${startTime}, 65)',`;

    //answerLocationY += 140;
    // Remove the trailing comma
    return drawTextCommands.trim().slice(0, -1);
};

async function generateSpeech(VideoHook, Question1, Question1A, Question2, Question2A, Question3, Question3A, Question4, Question4A, Question5, Question5A, Question6, Question6A, VideoOutro) {
    const client = new textToSpeech.v1beta1.TextToSpeechClient({
        credentials: {
            client_email: 'quickvid@quickvid-448819.iam.gserviceaccount.com',
            private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDe78lnqUm9EnDl\niDTaQ0azPCruq7Consb6wUgvEsyASb0Q3++r2cd6gIOfILUsdMO3tUe198KZ9asu\nnqjaGDnwsYX31LoanlHWD4RI7IGyHWwT2ifeLnrq83mprSYFKooPJXeqF8JJkGT9\nN/IUEhR5bNCjQp73EbmgX92/gMQoHDWobnZXakciDsaVUN+CLk1k1wL3VAtNhonf\nMO/0MuflHTNlPIsTvyH/QCxCndndHDS+cHY0h6VqZ6LydgEmoNCJ6FWVBDin8xos\ndvIF8aCwstbP/eDRg5jJm2ewOxNDQcfBNwJ36XhoQfOsHY6MtP7jIylCwK4xLxTY\n46bMUW9JAgMBAAECggEASBxa0s+E3QYOg4hDxEfXohk3r9zUNy6ooSqM3UEg6eww\nHjm5Liay6fKQ4JN1Vuxr9EvMZtU92owG83z5lBYbA7qAYXIrQnnscaeyO95Yc1Mm\nBuPdWnZBZycbNuGddzVT0+NkKh4mR6JPsEJ86LYSblZexDhD8BoJJ5Fqyktt56Th\nsDpTUmWa68QVx23Dco/3cpG+U6NmFBCVO3mykhwgMeg5I2dYFgwt7d67M6lQvn4l\noPRPfAsHa50+ox5qJr11h30Tm9v3Qy66MsNgGOV0VJWl7iClHw7D7WZ7AMeT80ml\nDhHwLA3jwcHo5pEbXs8adufj2xSI1vLKrViJVjjeowKBgQD1s5VjG/T7ItKkMAKf\nWsLg/Hwqb+Umn0Zu664o8Hk22HzLYaSpj+9RqzCaQ63E0BUCTRx2QuUtSLxmlxU+\nHNJWc+FHyxsrThs1o7ax06dQPg9rYLVF9IC87tgM+g9Ayewu0Xh6fOCK0SqBm6mE\nQRQ9I0uVjNst42mQeYQ+lDvcrwKBgQDoR+7S8PXQuTK7fkE9ZxZJBgh8jRaVINjF\nRmdSQcVp/egSnWElJMSTuQRYMBH1HH/Luez6NZsoUT3YajgaiRPeyP3L0pMANcoi\nF+ch1t2nnsuzOBZ9wDqGWia+YWNrNf7hE+/lcgc4uKZRlEjOxzxKYwmLsTTG9mwB\nfmNdreqhhwKBgECJQQ3dRAXK6cUSjz3IGzP5XavP5EK2x0tPQFmkgFI1nuHU7elT\n0yqCaqu6ZyQw+7O1CWrOu1+foUzZFk1QSLdIjL3MzYAcbe0y6UPgMixTgL1Vk4ei\nZ0Y4/iq6a9M6tny9rIWP03Li6eVNO8NvTJ+aa7oGW3O8Lfgy0teVG/wlAoGBAKE5\ntKJD0Et1EKqlQsFM+WHsRx20jHUsXGnpqTOmJVGhhGDPTiuK7sseQ862ZvB8PJP6\n1GsDpFOCuGurpo98kAc1+TttSM1/iHLLpomNa0K6bOdTygC02aqBjpzcWjaDPwuZ\nXA0lba/IMuEzDKpCDi4PugN1F432YxdSU8QlQFOnAoGAI//wNo3LGdVXfyGVnWYp\n9bGYQwQtRK3+gnxRDWjpC/fdpI3nF2kRVG9KPLzbN2HOVnoiFdQXSHxBiuS0SPFH\nU1K97+NbhClB3COdPjdW1fEXUyZnvOBnZHAciWTRtysoUayESMm4ZC8ybtMDaDsZ\nCtuiydA9LtWJCeaDj5XR3+8=\n-----END PRIVATE KEY-----\n'
        }
    });

    // Add a mark at the end of each word
    const ssmlText2 = VideoHook.split(' ')
        .map((word, index) => `${word} <mark name="hook_${index}"/>`)
        .join(' ');
    const ssmlTextQ1 = Question1.split(' ')
        .map((word, index) => `${word} <mark name="q1_${index}"/>`)
        .join(' ');
    const ssmlTextQ1A = Question1A.split(' ')
        .map((word, index) => `${word} <mark name="q1a_${index}"/>`)
        .join(' ');
    const ssmlTextQ2 = Question2.split(' ')
        .map((word, index) => `${word} <mark name="q2_${index}"/>`)
        .join(' ');
    const ssmlTextQ2A = Question2A.split(' ')
        .map((word, index) => `${word} <mark name="q2a_${index}"/>`)
        .join(' ');
    const ssmlTextQ3 = Question3.split(' ')
        .map((word, index) => `${word} <mark name="q3_${index}"/>`)
        .join(' ');
    const ssmlTextQ3A = Question3A.split(' ')
        .map((word, index) => `${word} <mark name="q3a_${index}"/>`)
        .join(' ');
    const ssmlTextQ4 = Question4.split(' ')
        .map((word, index) => `${word} <mark name="q4_${index}"/>`)
        .join(' ');
    const ssmlTextQ4A = Question4A.split(' ')
        .map((word, index) => `${word} <mark name="q4a_${index}"/>`)
        .join(' ');
    const ssmlTextQ5 = Question5.split(' ')
        .map((word, index) => `${word} <mark name="q5_${index}"/>`)
        .join(' ');
    const ssmlTextQ5A = Question5A.split(' ')
        .map((word, index) => `${word} <mark name="q5a_${index}"/>`)
        .join(' ');
    const ssmlTextQ6 = Question6.split(' ')
        .map((word, index) => `${word} <mark name="q6_${index}"/>`)
        .join(' ');
    const ssmlTextQ6A = Question6A.split(' ')
        .map((word, index) => `${word} <mark name="q6a_${index}"/>`)
        .join(' ');
    const ssmlText15 = VideoOutro.split(' ')
        .map((word, index) => `${word} <mark name="outro_${index}"/>`)
        .join(' ');

    const ssmlText = ssmlText2 + ssmlTextQ1 + "<break time='5s'/>" + ssmlTextQ1A + ssmlTextQ2 + "<break time='5s'/>" + ssmlTextQ2A + ssmlTextQ3 + "<break time='5s'/>" + ssmlTextQ3A + ssmlTextQ4 + "<break time='5s'/>" + ssmlTextQ4A + ssmlTextQ5 + "<break time='5s'/>" + ssmlTextQ5A + ssmlTextQ6 + "<break time='5s'/>" + ssmlTextQ6A + ssmlText15;
    const finalText = "<speak>" + ssmlText + "</speak>";

    console.log(finalText);

    const request = {
        input: {
            ssml: finalText
        },
        voice: { languageCode: 'en-US' },
        audioConfig: {
            audioEncoding: 'MP3',
        },
        enableTimePointing: ["SSML_MARK"]
    };

    try {
        const [response] = await client.synthesizeSpeech(request);

        //await fsp.writeFile('output.mp3', response.audioContent);

        // Print timepoints with words
        //response.timepoints.forEach(point => {
        //const wordIndex = point.markName.split('_')[1];
        //const word = text.split(' ')[wordIndex];
        //console.log(`Word: ${word}, Time: ${point.timeSeconds} seconds`);
        //});
        const newtimePoints = response.timepoints.map(point => point.timeSeconds);
        // Adjust timepoints by detecting large time jumps (5s breaks)
        // Process timepoints to handle breaks correctly
        const timePoints = [];
        for (let i = 0; i < newtimePoints.length; i++) {
            const currentTime = newtimePoints[i];

            // Skip first point processing
            if (i === 0) {
                timePoints.push(currentTime);
                continue;
            }

            const prevTime = newtimePoints[i - 1];

            // Check if there's a large gap (potential break)
            if (currentTime - prevTime >= 4.9 && currentTime - prevTime <= 10) {
                // Add the last timepoint before the break without adjustment
                //timePoints.push(currentTime-5);

                // Add a marker for the break
                timePoints.push("break");

                // Add the current time normally
                timePoints.push(currentTime);
            } else {
                // No break, add the current time normally
                timePoints.push(currentTime);
            }
        }

        console.log("New: " + timePoints);

        console.log("OLD: " + newtimePoints);
        const audioStream = new Readable({
            read() { }
        });
        audioStream.push(Buffer.from(response.audioContent));
        audioStream.push(null);
        return { audioStream, timePoints };

    } catch (error) {
        console.error('TTS Error:', error);
    }
}
async function processSixQuestionQuiz(req, res) {
    const {
        videoUrl,
        videoStartTime,
        VideoTitle,
        VideoHook,
        Question1,
        Question1A,
        Question2,
        Question2A,
        Question3,
        Question3A,
        Question4,
        Question4A,
        Question5,
        Question5A,
        Question6,
        Question6A,
        VideoOutro,
    } = req.body;
    ///questionDrift = 5500;
    currentTime = 0;
    timeline = 0;
    answerLocationX = 200;
    answerLocationY = 1010;
    //const videoUrl = req.query.url;
    //const videoStartTime = req.query.VideoStartTime;
    //const VideoTitle = req.query.VideoTitle;
    //const VideoHook = req.query.VideoHook;
    //const Question1 = req.query.Question1; // Updated variable name to Question1
    //const Question1A = req.query.Question1A; // Updated variable name to Question1
    //const Question2 = req.query.Question2; // Updated variable name to Question1
    //const Question2A = req.query.Question2A; // Updated variable name to Question1
    //const Question3 = req.query.Question3; // Updated variable name to Question1
    //const Question3A = req.query.Question3A; // Updated variable name to Question1
    //const Question4 = req.query.Question4; // Updated variable name to Question1
    //const Question4A = req.query.Question4A; // Updated variable name to Question1
    //const Question5 = req.query.Question5; // Updated variable name to Question1
    //const Question5A = req.query.Question5A; // Updated variable name to Question1
    //const Question6 = req.query.Question6; // Updated variable name to Question1
    //const Question6A = req.query.Question6A; // Updated variable name to Question1
    //const VideoOutro = req.query.VideoOutro; // Updated variable name to Question1

    if (!videoUrl) {
        return res.status(400).send('No URL provided.');
    }

    try {
        const FullSpeech = VideoHook + " " + Question1 + " " + Question1A + " " + Question2 + " " + Question2A + " " + Question3 + " " + Question3A + " " + Question4 + " " + Question4A + " " + Question5 + " " + Question5A + " " + Question6 + " " + Question6A + " " + VideoOutro;
        const { audioStream: finalStream, timePoints } = await generateSpeech(VideoHook, Question1, Question1A, Question2, Question2A, Question3, Question3A, Question4, Question4A, Question5, Question5A, Question6, Question6A, VideoOutro);
        console.log(timePoints);
        console.log(FullSpeech);
        const wordGenerationLines = await generateText(FullSpeech, timePoints);
        console.log(wordGenerationLines);

        const cleantimePoints = timePoints.filter(point => point !== "break");
        //VIDEO HOOK TIMING
        const getVideoHookCount = (VideoHook) => {
            return VideoHook.split(' ').length;
        };
        let timeTrack = 0;
        let timeTrackOld = 0;
        timeTrack += getVideoHookCount(VideoHook);
        const VideoHookTiming = cleantimePoints.slice(0, timeTrack);
        //QUESTION ONE TIMING
        const getQuestion1Count = (Question1) => {
            return Question1.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion1Count(Question1);
        const Question1Timing = cleantimePoints.slice(timeTrackOld, timeTrack);
        //QUESTION ONE ANSWER TIMING
        const getQuestion1ACount = (Question1A) => {
            return Question1A.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion1ACount(Question1A);
        const Question1ATiming = cleantimePoints.slice(timeTrackOld, timeTrack);
        const AnswerOneText = generateAnswers(Question1A, Question1ATiming, 1010);
        console.log(AnswerOneText);
        //QUESTION TWO TIMING
        const getQuestion2Count = (Question2) => {
            return Question2.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion2Count(Question2);
        const Question2Timing = cleantimePoints.slice(timeTrackOld, timeTrack);
        //QUESTION TWO ANSWER TIMING
        const getQuestion2ACount = (Question2A) => {
            return Question2A.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion2ACount(Question2A);
        const Question2ATiming = cleantimePoints.slice(timeTrackOld, timeTrack);
        const AnswerTwoText = generateAnswers(Question2A, Question2ATiming, 1150);
        //QUESTION THREE TIMING
        const getQuestion3Count = (Question3) => {
            return Question3.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion3Count(Question3);
        const Question3Timing = cleantimePoints.slice(timeTrackOld, timeTrack);
        //QUESTION THREE ANSWER TIMING
        const getQuestion3ACount = (Question3A) => {
            return Question3A.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion3ACount(Question3A);
        const Question3ATiming = cleantimePoints.slice(timeTrackOld, timeTrack);
        const AnswerThreeText = generateAnswers(Question3A, Question3ATiming, 1295);
        //QUESTION FOUR TIMING
        const getQuestion4Count = (Question4) => {
            return Question4.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion4Count(Question4);
        const Question4Timing = cleantimePoints.slice(timeTrackOld, timeTrack);
        //QUESTION FOUR ANSWER TIMING
        const getQuestion4ACount = (Question4A) => {
            return Question4A.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion4ACount(Question4A);
        const Question4ATiming = cleantimePoints.slice(timeTrackOld, timeTrack);
        const AnswerFourText = generateAnswers(Question4A, Question4ATiming, 1450);
        //QUESTION FIVE TIMING
        const getQuestion5Count = (Question5) => {
            return Question5.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion5Count(Question5);
        const Question5Timing = cleantimePoints.slice(timeTrackOld, timeTrack);
        //QUESTION FIVE ANSWER TIMING
        const getQuestion5ACount = (Question5A) => {
            return Question5A.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion5ACount(Question5A);
        const Question5ATiming = cleantimePoints.slice(timeTrackOld, timeTrack);
        const AnswerFiveText = generateAnswers(Question5A, Question5ATiming, 1595);
        //QUESTION SIX TIMING
        const getQuestion6Count = (Question6) => {
            return Question6.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion6Count(Question6);
        const Question6Timing = cleantimePoints.slice(timeTrackOld, timeTrack);
        //QUESTION SIX ANSWER TIMING
        const getQuestion6ACount = (Question6A) => {
            return Question6A.split(' ').length;
        };
        timeTrackOld = timeTrack;
        timeTrack += getQuestion6ACount(Question6A);
        const Question6ATiming = cleantimePoints.slice(timeTrackOld, timeTrack);
        const AnswerSixText = generateAnswers(Question6A, Question6ATiming, 1745);

        // Convert the audio stream to a buffer
        //const audioBuffer = await streamToBuffer(audioStream2);

        // Get the duration of the audio
        //const duration = getMP3Duration(audioBuffer);
        //console.log('Audio duration:', duration, 'ms');

        // Get the video format (audio and video combined)
        console.log("configuring proxy");
        //const agent = ytdl.createProxyAgent({ uri: 'http://152.26.229.42:9443' });  // Replace with the desired proxy IP and port
        //const agent = ytdl.createProxyAgent({ uri: 'http://72.10.160.93:28593' });  // Replace with the desired proxy IP and port
        console.log("created proxy");
        //const info = await ytdl.getInfo(videoUrl, { agent });
        //console.log(info);
        console.log("post proxy");
        // Set headers for video download
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        res.header('Content-Type', mime.lookup('mp4') || 'application/octet-stream');
        res.header('Cache-Control', 'no-cache');
        res.header('Connection', 'keep-alive'); // Prevents premature disconnect
        //DOWNLOAD VIDEO
        let tempVideoPath = path.join(__dirname, `backgroundvideo-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`);
        try {
            const info = await ytdl.getInfo(videoUrl);
            console.log("finding info");
            let format = info.formats.find(format => format.qualityLabel === '1080p60' && format.container === 'mp4');
            if (!format) {
                format = info.formats.find(format => format.qualityLabel === '1440p60' && format.container === 'mp4');
                console.log("144060");
            }
            if (!format) {
                format = info.formats.find(format => format.qualityLabel === '1440p' && format.container === 'mp4');
                console.log("1440");
            }
            if (!format) {
                format = info.formats.find(format => format.qualityLabel === '1440p' && format.container === 'mp4');
            }
            if (!format) {
                format = ytdl.chooseFormat(info.formats, {
                    quality: 'highestvideo',
                    container: 'mp4'
                });
                console.log("HIGHEST");
            }
            if (!format) {
                return res.status(400).send('No suitable format found.');
            }
            console.log(format);
            console.log(info);
            ytdl(videoUrl, { format: format, begin: `${videoStartTime}s`, highWaterMark: 1024 * 1024 * 10 }).pipe(fs.createWriteStream(tempVideoPath));
            console.log("Waiting for videostream");
            await new Promise(resolve => setTimeout(resolve, 3000));
            const stats = fs.statSync(tempVideoPath);
            if (stats.size === 0) {
                // Cleanup temporary files after sending response
                fs.unlink(tempVideoPath, (err) => {
                    if (err) console.error('Error removing temporary video file:', err);
                });
                throw new Error("Download failed: File is empty.");
            }
            console.log("Continuing with stream");
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        catch (error) {
            // Replace your current Python spawn code with this:
            await new Promise((resolve, reject) => {
                const pythonProcess = spawn("python", ["download_video.py", videoUrl, tempVideoPath, videoStartTime]);

                pythonProcess.stdout.on("data", (data) => {
                    console.log(`Python Output: ${data.toString()}`);
                });

                pythonProcess.stderr.on("data", (data) => {
                    console.error(`Python Error: ${data.toString()}`);
                });

                pythonProcess.on("close", (code) => {
                    console.log(`Python process exited with code ${code}`);
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Python process exited with code ${code}`));
                    }
                });
            });

        }
        // Add this 2-second delay before starting FFmpeg
        console.log("Video stream is ready, waiting 2 seconds before starting FFmpeg...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("2-second wait complete, starting FFmpeg process now...");
        //const outputFilePath = path.join('/tmp', 'output.mp4');
        //const outputFilePath = path.join(__dirname, 'video.mp4');
        const outputFilePath = path.join(__dirname, `video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`);

        // Set up FFmpeg process
        const VideoTitleSet = `drawtext=text='${VideoTitle}':x=(w-text_w)/2:y=(h-text_h)/6:fontsize=100:fontcolor=white:fontfile='${fontPath}'`;
        const QuestionNum1 = `drawtext=text=1):x=100:y=1000:fontsize=70:fontcolor=white:fontfile='${fontPath}'`;
        const QuestionNum2 = `drawtext=text='2)':x=100:y=1150:fontsize=70:fontcolor=white:fontfile='${fontPath}'`;
        const QuestionNum3 = `drawtext=text='3)':x=100:y=1300:fontsize=70:fontcolor=white:fontfile='${fontPath}'`;
        const QuestionNum4 = `drawtext=text='4)':x=100:y=1450:fontsize=70:fontcolor=white:fontfile='${fontPath}'`;
        const QuestionNum5 = `drawtext=text='5)':x=100:y=1600:fontsize=70:fontcolor=white:fontfile='${fontPath}'`;
        const QuestionNum6 = `drawtext=text='6)':x=100:y=1750:fontsize=70:fontcolor=white:fontfile='${fontPath}'`;
        //const Question1Ans = `drawtext=text='${Question1A}':x=200:y=1000:fontsize=70:fontcolor=white:enable='between(t,5,65)'`;
        //const Question2Ans = `drawtext=text='${Question2A}':x=200:y=1150:fontsize=70:fontcolor=white:enable='between(t,5,65)'`;
        //const Question3Ans = `drawtext=text='${Question3A}':x=200:y=1300:fontsize=70:fontcolor=white:enable='between(t,5,65)'`;
        //const Question4Ans = `drawtext=text='${Question4A}':x=200:y=1450:fontsize=70:fontcolor=white:enable='between(t,5,65)'`;
        //const Question5Ans = `drawtext=text='${Question5A}':x=200:y=1600:fontsize=70:fontcolor=white:enable='between(t,5,65)'`;
        //const Question6Ans = `drawtext=text='${Question6A}':x=200:y=1750:fontsize=70:fontcolor=white:enable='between(t,5,65)'`;
        const ffmpeg = spawn(ffmpegPath, [
            '-f', 'mp4',  // Force input format
            '-ss', '0',                  // Start from the beginning (ensures the video is trimmed from start)
            '-r', '45',
            //'-thread_queue_size', '1024', // Increase thread queue for audio input
            //'-i', 'pipe:3',              // Video stream input
            '-i', tempVideoPath,         // Use the file instead of pipe:3
            '-thread_queue_size', '1024', // Increase thread queue for audio input
            '-i', 'pipe:4',              // Audio input
            '-vf', `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,${VideoTitleSet},${wordGenerationLines},${QuestionNum1},${QuestionNum2},${QuestionNum3},${QuestionNum4},${QuestionNum5},${QuestionNum6},${AnswerOneText},${AnswerTwoText},${AnswerThreeText},${AnswerFourText},${AnswerFiveText},${AnswerSixText}`, // Text overlay
            '-c:v', 'libx264',           // Video codec (H.264)
            '-c:a', 'aac',               // Audio codec (AAC)
            '-preset', 'ultrafast',       // Use ultrafast encoding preset
            '-strict', 'experimental',   // Allow AAC codec usage
            '-map', '0:v',
            '-map', '1:a',
            '-t', '60',                  // Set video duration to 60 seconds
            '-f', 'mp4',                 // Output format
            '-max_muxing_queue_size', '4096', // Increase muxing queue size
            outputFilePath               // Write to the temporary file
        ], {
            stdio: [
                'pipe', 'pipe', 'pipe',   // stdin, stdout, stderr
                'pipe',                   // video input
                'pipe'                    // audio input
            ]
        });

        finalStream.pipe(ffmpeg.stdio[4]).on('error', (err) => {
            if (err.code === 'EPIPE') {
                console.warn('Audio stream ended unexpectedly (EPIPE)');
            } else {
                console.error('Error in audio stream:', err);
            }
        });

        finalStream.on('end', () => {
            ffmpeg.stdio[4].end(); // Close audio input pipe
        });

        // Handle stderr to log any errors
        ffmpeg.stderr.on('data', (data) => {
            console.error(`FFmpeg stderr: ${data}`);
        });

        // Handle errors during the FFmpeg process
        ffmpeg.on('error', (err) => {
            console.error('FFmpeg error:', err);
        });

        // When FFmpeg finishes, handle sending the result to the client
        ffmpeg.on('close', (code) => {
            console.log(`FFmpeg process closed with code ${code}`);

            // Attempt to send the video file to the client, even if FFmpeg failed
            fs.stat(outputFilePath, (err, stats) => {
                if (err || !stats.isFile()) {
                    console.error('Output file not found or inaccessible:', err);
                    return res.status(500).send('Failed to generate video.');
                }

                // Send the file if it exists
                res.sendFile(outputFilePath, (err) => {
                    //res.download(outputFilePath, 'video.mp4', (err) => {
                    if (err) {
                        console.error('Error sending file:', err);
                    }

                    // Cleanup temporary files after sending response
                    fs.unlink(outputFilePath, (err) => {
                        if (err) console.error('Error removing temporary output file:', err);
                    });
                    // Cleanup temporary files after sending response
                    fs.unlink(tempVideoPath, (err) => {
                        if (err) console.error('Error removing temporary video file:', err);
                    });
                });
            });
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request.');
    }
};
module.exports = {
    processSixQuestionQuiz
};