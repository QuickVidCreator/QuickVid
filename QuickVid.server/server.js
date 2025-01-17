const { processSixQuestionQuiz } = require('./sixquestionquiz.js');
const express = require('express');
const https = require('https');  // Import the https module
const cors = require('cors');
const app = express();
app.use(cors());
app.get('/download', async (req, res) => {
    try {
        // Process the video and send the file
        await processSixQuestionQuiz(req, res);
    } catch (err) {
        console.error('Error in video processing:', err);
        res.status(500).send('Error in processing video');
    }
});

https.createServer({ key: key, cert: cert }, app)
    .listen(4000, () => {
        console.log('HTTPS server running on https://localhost:3000');
    });
