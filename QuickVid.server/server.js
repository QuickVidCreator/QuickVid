const { processSixQuestionQuiz } = require('./sixquestionquiz.js');
const express = require('express');
const https = require('https');  // Import the https module
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(express.json());  // Add this line
app.use(cors());
const cert = fs.readFileSync(path.join(__dirname, 'certificate.pem'));
const key = fs.readFileSync(path.join(__dirname, 'key.pem'));

app.post('/download', async (req, res) => {
    try {
        console.log("REQUESTED");
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
