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
let questionDrift = 5500;
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
    durations.push({ word: '', duration: questionDrift });
    //questionDrift += 50;

    return durations;
};
let currentTime = 0;
let timeline = 0;
const generateText = async (text) => {
    const durations = await processTextToWords(text);
    currentTime = timeline;
    //let currentTime = 0; // Cumulative time tracker
    let drawTextCommands = '';

    for (const { word, duration } of durations) {
        const startTime = currentTime / 1000; // Convert ms to seconds
        const endTime = (currentTime + duration) / 1000;
        console.log("starting: " + startTime + " Ending: " + endTime);
        drawTextCommands += `drawtext=text='${word}':x=(w-text_w)/2:y=(h-text_h)/3:fontsize=100:fontcolor=white:fontfile='${fontPath}':enable='between(t,${startTime},${endTime})',`;

        currentTime += duration; // Update cumulative time
    }

    // Remove the trailing comma
    return drawTextCommands.trim().slice(0, -1);
};

let answerLocationX = 200;
let answerLocationY = 1005;
const generateAnswers = async (text) => {
    const durations = await processTextToWords(text);
    let drawTextCommands = '';

    currentTime = timeline;
    // Display the full version of the answer at the start
    const startTime = currentTime / 1000; // Convert ms to seconds
    //drawTextCommands += `drawtext=text='${text}':x=${answerLocationX}:y=${answerLocationY}:fontsize=70:fontcolor=white:fontfile='${fontPath}':enable='between(t,${startTime}, ${startTime + (60 - startTime)})',`;
    drawTextCommands += `drawtext=text='${text}':x=${answerLocationX}:y=${answerLocationY}:fontsize=70:fontcolor=white:fontfile='${fontPath}':enable='between(t,${startTime}, 65)',`;


    // Loop through each word and display them one by one
    for (const { word, duration } of durations) {
        const wordStartTime = currentTime / 1000; // Convert ms to seconds
        const wordEndTime = (currentTime + duration) / 1000; // Convert ms to seconds

        console.log("Word: " + word + " | Start: " + wordStartTime + " | End: " + wordEndTime);

        drawTextCommands += `drawtext=text='${word}':x=(w-text_w)/2:y=(h-text_h)/3:fontsize=100:fontcolor=white:fontfile='${fontPath}':enable='between(t,${wordStartTime},${wordEndTime})',`;

        currentTime += duration; // Update cumulative time after processing each word
    }
    answerLocationY += 150;
    // Remove the trailing comma
    return drawTextCommands.trim().slice(0, -1);
};

const generateQuestions = async (text) => {
    const durations = await processQuestionsToWords(text);
    let drawTextCommands = '';

    currentTime = timeline;

    for (const { word, duration } of durations) {
        const startTime = currentTime / 1000; // Convert milliseconds to seconds for FFmpeg
        const endTime = (currentTime + duration) / 1000;

        console.log("starting: " + startTime + " Ending: " + endTime);
        drawTextCommands += `drawtext=text='${word}':x=(w-text_w)/2:y=(h-text_h)/3:fontsize=100:fontcolor=white:fontfile='${fontPath}':enable='between(t,${startTime},${endTime})',`;

        currentTime += duration; // Add the duration of the current word to the cumulative timeline
    }

    // Remove the trailing comma at the end of the generated commands
    return drawTextCommands.trim().slice(0, -1);
};


// Define the merge function
const merge = (...streams) => {
    const pass = new PassThrough();
    const appendNextStream = (index) => {
        if (index >= streams.length) {
            pass.end(); // End the PassThrough stream after the last input stream
            return;
        }
        const currentStream = streams[index];
        currentStream.pipe(pass, { end: false });
        currentStream.on('end', () => appendNextStream(index + 1));
    };
    appendNextStream(0); // Start with the first stream
    return pass;
};

app.get('/download', async (req, res) => {
    try {
        // Process the video and send the file
        await processVideo(req, res);
    } catch (err) {
        console.error('Error in video processing:', err);
        res.status(500).send('Error in processing video');
    }
});

async function processVideo(req, res) {
    ///questionDrift = 5500;
    currentTime = 0;
    timeline = 0;
    answerLocationX = 200;
    answerLocationY = 1005;
    const videoUrl = req.query.url;
    const videoStartTime = req.query.VideoStartTime;
    const VideoTitle = req.query.VideoTitle;
    const VideoHook = req.query.VideoHook;
    const Question1 = req.query.Question1; // Updated variable name to Question1
    const Question1A = req.query.Question1A; // Updated variable name to Question1
    const Question2 = req.query.Question2; // Updated variable name to Question1
    const Question2A = req.query.Question2A; // Updated variable name to Question1
    const Question3 = req.query.Question3; // Updated variable name to Question1
    const Question3A = req.query.Question3A; // Updated variable name to Question1
    const Question4 = req.query.Question4; // Updated variable name to Question1
    const Question4A = req.query.Question4A; // Updated variable name to Question1
    const Question5 = req.query.Question5; // Updated variable name to Question1
    const Question5A = req.query.Question5A; // Updated variable name to Question1
    const Question6 = req.query.Question6; // Updated variable name to Question1
    const Question6A = req.query.Question6A; // Updated variable name to Question1
    const VideoOutro = req.query.VideoOutro; // Updated variable name to Question1

    if (!videoUrl) {
        return res.status(400).send('No URL provided.');
    }

    try {
        const FullSpeech = VideoHook + Question1 + Question1A + Question2 + Question2A;

        //const wordDurations = await processTextToWords(VideoHook);

        // Generate Text-to-Speech audio using Question1 input
        const VideoHookGTTS = new gTTS(VideoHook, 'en', 'us');
        const Question1GTTS = new gTTS(Question1, 'en', 'us');
        const Question1AGTTS = new gTTS(Question1A, 'en', 'us');
        const Question2GTTS = new gTTS(Question2, 'en', 'us');
        const Question2AGTTS = new gTTS(Question2A, 'en', 'us');
        const Question3GTTS = new gTTS(Question3, 'en', 'us');
        const Question3AGTTS = new gTTS(Question3A, 'en', 'us');
        const Question4GTTS = new gTTS(Question4, 'en', 'us');
        const Question4AGTTS = new gTTS(Question4A, 'en', 'us');
        const Question5GTTS = new gTTS(Question5, 'en', 'us');
        const Question5AGTTS = new gTTS(Question5A, 'en', 'us');
        const Question6GTTS = new gTTS(Question6, 'en', 'us');
        const Question6AGTTS = new gTTS(Question6A, 'en', 'us');
        const VideoOutroGTTS = new gTTS(VideoOutro, 'en', 'us');

        // Create a readable stream for the generated audio using .stream()
        const VideoHookStream = VideoHookGTTS.stream();
        const VHStreamTime = VideoHookGTTS.stream();
        const Question1Stream = Question1GTTS.stream();
        const Q1Time = Question1GTTS.stream();
        const Question1AStream = Question1AGTTS.stream();
        const Q1ATime = Question1AGTTS.stream();
        const Question2Stream = Question2GTTS.stream();
        const Q2Time = Question2GTTS.stream();
        const Question2AStream = Question2AGTTS.stream();
        const Q2ATime = Question2AGTTS.stream();
        const Question3Stream = Question3GTTS.stream();
        const Q3Time = Question3GTTS.stream();
        const Question3AStream = Question3AGTTS.stream();
        const Q3ATime = Question3AGTTS.stream();
        const Question4Stream = Question4GTTS.stream();
        const Q4Time = Question4GTTS.stream();
        const Question4AStream = Question4AGTTS.stream();
        const Q4ATime = Question4AGTTS.stream();
        const Question5Stream = Question5GTTS.stream();
        const Q5Time = Question5GTTS.stream();
        const Question5AStream = Question5AGTTS.stream();
        const Q5ATime = Question5AGTTS.stream();
        const Question6Stream = Question6GTTS.stream();
        const Q6Time = Question6GTTS.stream();
        const Question6AStream = Question6AGTTS.stream();
        const Q6ATime = Question6AGTTS.stream();
        const VideoOutroStream = VideoOutroGTTS.stream();
        const VideoOutroTime = VideoOutroGTTS.stream();

        //Create the timeline
        const timelineBuffer1 = await streamToBuffer(VHStreamTime);
        const timelineBuffer2 = await streamToBuffer(Q1Time);
        const timelineBuffer3 = await streamToBuffer(Q1ATime);
        const timelineBuffer4 = await streamToBuffer(Q2Time);
        const timelineBuffer5 = await streamToBuffer(Q2ATime);
        const timelineBuffer6 = await streamToBuffer(Q3Time);
        const timelineBuffer7 = await streamToBuffer(Q3ATime);
        const timelineBuffer8 = await streamToBuffer(Q4Time);
        const timelineBuffer9 = await streamToBuffer(Q4ATime);
        const timelineBuffer10 = await streamToBuffer(Q5Time);
        const timelineBuffer11 = await streamToBuffer(Q5ATime);
        const timelineBuffer12 = await streamToBuffer(Q6Time);
        const timelineBuffer13 = await streamToBuffer(Q6ATime);
        const timelineBuffer14 = await streamToBuffer(VideoOutroTime);

        const timer = fs.createReadStream(timerPath);
        const timer2 = fs.createReadStream(timerPath);
        const timer3 = fs.createReadStream(timerPath);
        const timer4 = fs.createReadStream(timerPath);
        const timer5 = fs.createReadStream(timerPath);
        const timer6 = fs.createReadStream(timerPath);
        const combinedStream = merge(VideoHookStream, Question1Stream);
        const combinedStream2 = merge(combinedStream, timer);
        const combinedStream3 = merge(combinedStream2, Question1AStream);
        const combinedStream4 = merge(combinedStream3, Question2Stream);
        const combinedStream5 = merge(combinedStream4, timer2);
        const combinedStream6 = merge(combinedStream5, Question2AStream);
        const combinedStream7 = merge(combinedStream6, Question3Stream);
        const combinedStream8 = merge(combinedStream7, timer3);
        const combinedStream9 = merge(combinedStream8, Question3AStream);
        const combinedStream10 = merge(combinedStream9, Question4Stream);
        const combinedStream11 = merge(combinedStream10, timer4);
        const combinedStream12 = merge(combinedStream11, Question4AStream);
        const combinedStream13 = merge(combinedStream12, Question5Stream);
        const combinedStream14 = merge(combinedStream13, timer5);
        const combinedStream15 = merge(combinedStream14, Question5AStream);
        const combinedStream16 = merge(combinedStream15, Question6Stream);
        const combinedStream17 = merge(combinedStream16, timer6);
        const combinedStream18 = merge(combinedStream17, Question6AStream);
        const finalStream = merge(combinedStream18, VideoOutroStream);

        //const audioStream2 = gtts.stream();

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
        const info = await ytdl.getInfo(videoUrl);
        //console.log(info);
        console.log("post proxy");

        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo' });
        if (!format) {
            return res.status(400).send('No suitable format found.');
        }

        // Set headers for video download
        res.header('Content-Disposition', 'attachment; filename="video.mp4"');
        res.header('Content-Type', mime.lookup('mp4') || 'application/octet-stream');
        res.header('Cache-Control', 'no-cache');
        res.header('Connection', 'keep-alive'); // Prevents premature disconnect


        //const videoStream = ytdl(videoUrl, { format: format, agent });
        //const videoStream = ytdl(videoUrl, { format: format});

        //const videoStream = ytdl(videoUrl, { format: format, highWaterMark: 1024 * 1024 * 32 });
        const clipStartTime = videoStartTime;
        const clipDuration = 60; // Clip length (60 seconds)

        const videoStream = ytdl(videoUrl, { fmt: "mp4", begin: `${clipStartTime}s` });

        // Stop stream after 60 seconds
        setTimeout(() => {
            videoStream.destroy();
            console.log("Snippet download stopped.");
        }, clipDuration * 1000);
        await new Promise((resolve) => {
            videoStream.once('readable', resolve); // Ensures some data is buffered before starting ffmpeg
        });
        //const outputFilePath = path.join('/tmp', 'output.mp4');
        const outputFilePath = path.join(__dirname, 'video.mp4');


        // draw the texts
        const hookDrawText = await generateText(VideoHook);
        timeline = getMP3Duration(timelineBuffer1);
        const Question1DrawText = await generateQuestions(Question1);
        timeline += getMP3Duration(timelineBuffer2) + 5000;
        const Question1ADrawText = await generateAnswers(Question1A);
        timeline += getMP3Duration(timelineBuffer3);
        const Question2DrawText = await generateQuestions(Question2);
        timeline += getMP3Duration(timelineBuffer4) + 5000;
        const Question2ADrawText = await generateAnswers(Question2A);
        timeline += getMP3Duration(timelineBuffer5);
        const Question3DrawText = await generateQuestions(Question3);
        timeline += getMP3Duration(timelineBuffer6) + 5000;
        const Question3ADrawText = await generateAnswers(Question3A);
        timeline += getMP3Duration(timelineBuffer7);
        const Question4DrawText = await generateQuestions(Question4);
        timeline += getMP3Duration(timelineBuffer8) + 5000;
        const Question4ADrawText = await generateAnswers(Question4A);
        timeline += getMP3Duration(timelineBuffer9);
        const Question5DrawText = await generateQuestions(Question5);
        timeline += getMP3Duration(timelineBuffer10) + 5000;
        const Question5ADrawText = await generateAnswers(Question5A);
        timeline += getMP3Duration(timelineBuffer11);
        const Question6DrawText = await generateQuestions(Question6);
        timeline += getMP3Duration(timelineBuffer12) + 5000;
        const Question6ADrawText = await generateAnswers(Question6A);
        timeline += getMP3Duration(timelineBuffer13);
        const VideoOutroDrawText = await generateText(VideoOutro);

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
            '-ss', '0',                  // Start from the beginning (ensures the video is trimmed from start)
            '-i', 'pipe:3',              // Video stream input
            '-thread_queue_size', '1024', // Increase thread queue for audio input
            '-i', 'pipe:4',              // Audio input
            '-vf', `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,${VideoTitleSet},${QuestionNum1}, ${QuestionNum2}, ${QuestionNum3},${QuestionNum4}, ${QuestionNum5}, ${QuestionNum6}, ${hookDrawText}, ${Question1DrawText}, ${Question1ADrawText}, ${Question2DrawText}, ${Question2ADrawText}, ${Question3DrawText}, ${Question3ADrawText}, ${Question4DrawText}, ${Question4ADrawText}, ${Question5DrawText}, ${Question5ADrawText}, ${Question6DrawText}, ${Question6ADrawText}, ${VideoOutroDrawText}`, // Text overlay
            '-c:v', 'libx264',           // Video codec (H.264)
            '-c:a', 'aac',               // Audio codec (AAC)
            '-preset', 'ultrafast',       // Use ultrafast encoding preset
            '-strict', 'experimental',   // Allow AAC codec usage
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

        // Pipe video and audio streams into FFmpeg
        videoStream.pipe(ffmpeg.stdio[3]).on('error', (err) => {
            if (err.code === 'EPIPE') {
                console.warn('Video stream ended unexpectedly (EPIPE)');
            } else {
                console.error('Error in video stream:', err);
            }
        });

        finalStream.pipe(ffmpeg.stdio[4]).on('error', (err) => {
            if (err.code === 'EPIPE') {
                console.warn('Audio stream ended unexpectedly (EPIPE)');
            } else {
                console.error('Error in audio stream:', err);
            }
        });

        // Ensure that FFmpeg knows the end of input streams is coming by explicitly ending the pipes
        videoStream.on('end', () => {
            ffmpeg.stdio[3].end(); // Close video input pipe
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
                });
            });
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request.');
    }
};

https.createServer({ key: key, cert: cert }, app)
    .listen(4000, () => {
        console.log('HTTPS server running on https://localhost:3000');
    });
