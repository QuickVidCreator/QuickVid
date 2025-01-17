const { processSixQuestionQuiz } = require('./sixquestionquiz.js');

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
