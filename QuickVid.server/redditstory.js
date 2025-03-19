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
const { Readable } = require('stream'); // Use require for consistency
const textToSpeech = require('@google-cloud/text-to-speech');
const fsp = require('fs').promises;
const logFile = fs.createWriteStream(`redditstory-output-${Date.now()}.log`, { flags: 'a' });

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
    const finalText = "<speak>" + ssmlText + "</speak>";

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
        response.timepoints.forEach(point => {
            const wordIndex = point.markName.split('_')[1];
            const word = text.split(' ')[wordIndex];
            console.log(`Word: ${word}, Time: ${point.timeSeconds} seconds`);
        });
        const timePoints = response.timepoints.map(point => point.timeSeconds);
        console.log(timePoints);
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
async function processRedditStory(req, res) {
    const {
        videoUrl,
        videoStartTime,
        VideoTitle,
        //VideoHook,
        VideoText,
        VideoOutro
    } = req.body;
    VideoText = VideoText.replace(/'/g, "");
    console.log("REDDIT STORY SUCCESS");
    console.log(VideoText);
    //generateSpeech('Hello world, how are you today?')
    //.then(result => console.log(result.wordTimings));
    const { audioStream: RedditAudio, timePoints } = await generateSpeech(VideoText);
    //DOWNLOAD VIDEO
    const info = await ytdl.getInfo(videoUrl);

    let format = info.formats.find(format => format.qualityLabel === '1080p60' && format.container === 'mp4');
    if (!format) {
        format = info.formats.find(format => format.qualityLabel === '1440p60' && format.container === 'mp4');
    }
    if (!format) {
        format = info.formats.find(format => format.qualityLabel === '1440p' && format.container === 'mp4');
    }
    if (!format) {
        format = info.formats.find(format => format.qualityLabel === '1440p' && format.container === 'mp4');
    }
    if (!format) {
        format = ytdl.chooseFormat(info.formats, {
            quality: 'highestvideo',
            container: 'mp4'
        });
    }
    if (!format) {
        return res.status(400).send('No suitable format found.');
    }
    console.log(format);
    console.log(info);
    // Set headers for video download
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');
    res.header('Content-Type', mime.lookup('mp4') || 'application/octet-stream');
    res.header('Cache-Control', 'no-cache');
    res.header('Connection', 'keep-alive'); // Prevents premature disconnect
    const clipStartTime = videoStartTime;
    const clipDuration = 40; // Clip length (60 seconds)

    const videoStream = ytdl(videoUrl, {
        format: format,
        begin: `${clipStartTime}s`,
        highWaterMark: 1024 * 1024 * 10, // 10MB buffer (default is much smaller)
    }).on('error', (err) => {
        console.error('YT video stream error:', err);
        res.status(500).send('Failed to process video.');
    });
    const tempVideoPath = path.join(__dirname, `backgroundvideo-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`);
    ytdl(videoUrl, { format: format, begin: `${clipStartTime}s`, highWaterMark: 1024 * 1024 * 10 }).pipe(fs.createWriteStream(tempVideoPath));
    // Stop stream after 60 seconds
    setTimeout(() => {
        videoStream.destroy();
        console.log("Snippet download stopped.");
    }, clipDuration * 1000);
    await new Promise((resolve, reject) => {
        videoStream.once('readable', resolve);
        videoStream.once('error', reject);
    });


    // Add this 5-second delay before starting FFmpeg
    console.log("Video stream is ready, waiting 5 seconds before starting FFmpeg...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("5-second wait complete, starting FFmpeg process now...");

    const VideoTitleSet = `drawtext=text='${VideoTitle}':x=(w-text_w)/2:y=(h-text_h)/6:fontsize=100:fontcolor=white:fontfile='${fontPath}'`;

    const outputFilePath = path.join(__dirname, `video-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`);
    const RedditText = generateText(VideoText, timePoints);
    console.log(RedditText);
    const ffmpeg = spawn(ffmpegPath, [
        '-f', 'mp4',  // Force input format
        '-ss', '0',                  // Start from the beginning (ensures the video is trimmed from start)
        '-r', '45',
        //'-thread_queue_size', '1024', // Increase thread queue for audio input
        //'-i', 'pipe:3',              // Video stream input
        '-i', tempVideoPath,         // Use the file instead of pipe:3
        '-thread_queue_size', '1024', // Increase thread queue for audio input
        '-i', 'pipe:4',              // Audio input
        //'-vf', `scale=1080:1920:flags=lanczos,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,${RedditText}`, // High-quality scaling
        '-vf', `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,${VideoTitleSet},${RedditText}`, // Text overlay
        '-c:v', 'libx264',           // Video codec (H.264)
        '-c:a', 'aac',               // Audio codec (AAC)
        '-preset', 'ultrafast',               // Better quality than ultrafast
        '-tune', 'fastdecode',
        //'-crf', '18',                        // High quality (lower = better)
        '-strict', 'experimental',   // Allow AAC codec usage
        //'-map', '0:v',
        //'-map', '1:a',
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
    //videoStream.pipe(ffmpeg.stdio[3]).on('error', (err) => {
    //if (err.code === 'EPIPE') {
    //console.warn('Video stream ended unexpectedly (EPIPE)');
    //} else {
    //console.error('Error in video stream:', err);
    //}
    //});

    RedditAudio.pipe(ffmpeg.stdio[4]).on('error', (err) => {
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

    RedditAudio.on('end', () => {
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
}
const generateText = (text, timePoints) => {
    let drawTextCommands = '';
    const words = text.split(' '); // Still need this to get the actual words

    // Using timePoints.length directly to determine iterations
    for (let i = 0; i < timePoints.length; i++) {
        const word = words[i];
        const startTime = i === 0 ? 0 : timePoints[i - 1];
        const endTime = timePoints[i];

        console.log(`Word: ${word} - Starting: ${startTime} Ending: ${endTime}`);

        drawTextCommands += `drawtext=text='${word}':` +
            `x=(w-text_w)/2:` +
            `y=(h-text_h)/3:` +
            `fontsize=100:` +
            `fontcolor=white:` +
            `fontfile='${fontPath}':` +
            `enable='between(t,${startTime},${endTime})',`;
    }

    return drawTextCommands.slice(0, -1);
};
//const generateText = async (text) => {
//    const timeTracker = 1;
//    const startTime = 0;
//    const endTime = timePoints[timeTracker];
//    //let currentTime = 0; // Cumulative time tracker
//    let drawTextCommands = '';

//    for (let i = 0; i < timePoints.length; i++) {
//        //const startTime = currentTime / 1000; // Convert ms to seconds
//        //const endTime = (currentTime + duration) / 1000;
//        console.log("starting: " + startTime + " Ending: " + endTime);
//        drawTextCommands += `drawtext=text='${word}':x=(w-text_w)/2:y=(h-text_h)/3:fontsize=100:fontcolor=white:fontfile='${fontPath}':enable='between(t,${startTime},${endTime})',`;
//        startTime = endTime;
//        endTime = timePoints[timeTracker + 1];
//        currentTime += duration; // Update cumulative time
//    }

//    // Remove the trailing comma
//    return drawTextCommands.trim().slice(0, -1);
//};
module.exports = {
    processRedditStory
};