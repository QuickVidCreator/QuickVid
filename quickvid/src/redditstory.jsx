import { useState } from 'react';
import './redditstory.css'; // Import the CSS file
import './global.css';
const getVideoLimit = async () => {
    try {
        const response = await fetch('https://your-wordpress-site.com/wp-admin/admin-ajax.php?action=get_video_limit', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',  // Include cookies to maintain session (this assumes the user is logged in)
        });

        const data = await response.json();

        if (data.success) {
            console.log('Video Limit:', data.data.video_limit);
        } else {
            console.error('Error:', data.data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// Call the function to get the video limit
getVideoLimit();
const redditStory = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoStartTime, setVideoStartTime] = useState('');
    const [VideoTitle, setVideoTitle] = useState('');
    const [VideoHook, setVideoHook] = useState('');
    const [VideoText, setVideoText] = useState(''); // Updated variable name for user input
    const [VideoOutro, setVideoOutro] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(false);

    getVideoLimit();

    const handleDownload = async () => {
        if (!videoUrl) {
            alert('Please enter a valid YouTube URL');
            return;
        }
        if (!VideoTitle) {
            alert('Please enter a valid video title');
            return;
        }
        if (!VideoHook) {
            alert('Please enter a valid video title');
            return;
        }
        if (!VideoOutro) {
            alert('Please enter a valid video outro');
            return;
        }
        setIsDownloading(true);
        progressBarFunction()

        try {
            //const response = await fetch('https://75.135.157.2:3000/download', {
            const response = await fetch('https://api.quick-vid.com:3000/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videoType: 'redditStory',
                    videoUrl,
                    videoStartTime,
                    VideoTitle,
                    VideoHook,
                    VideoText,
                    VideoOutro
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'video.mp4';
            document.body.appendChild(a);
            a.click();
            a.remove();
            // Notify progress function that the file is received
            setProgressValue(1);
            setTimeout(() => {
                setShowProgress(false);
            }, 500);
        } catch (error) {
            console.error('Error during download:', error);
            alert('An error occurred while downloading the video.');
        } finally {
            setIsDownloading(false);
        }
    };

    function progressBarFunction() {
        let progress = 0.0;
        setShowProgress(true);

        const interval = setInterval(() => {
            progress += (progress < 0.7 ? 0.004 : (progress < 0.8 ? 0.003 : 0.001));
            setProgressValue(progress);

            if (progress >= 1) {
                clearInterval(interval);
            }
        }, 50); // Runs every 100ms

        // Stop the progress when the file is received
        setProgressValue(prev => {
            if (prev >= 1) {
                clearInterval(interval);
                return 1;
            }
            return prev;
        });
    }


    return (
        <div className="quiz-container">
            <button className="back-button">Back</button>
            <h1 className="QuestionQuizTitle">Reddit Story</h1>
            <h2 className="QATitles">Set the video background</h2>
            <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter YouTube URL"
                className="url-input" />
            <h2 className="QATitles">Set the clip start time (in seconds)</h2>
            <input
                type="number"
                value={videoStartTime}
                onChange={(e) => setVideoStartTime(e.target.value)}
                placeholder="Enter number"
                min="0"
                className="num-input" />
            <h2 className="QATitles">Set the video title</h2>
            <input
                type="text"
                value={VideoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter Video Title"
                className="text-input" />
            <h2 className="QATitles">Set the video hook</h2>
            <input
                type="text"
                value={VideoHook}
                onChange={(e) => setVideoHook(e.target.value)}
                placeholder="Enter Video Hook"
                className="text-input" />
            <br />
            <h2 className="QATitles">Set the reddit story text</h2>
            <input
                type="text"
                value={VideoText}
                onChange={(e) => setVideoText(e.target.value)}
                placeholder="Enter Reddit Story Text"
                className="text-input" />
            <h2 className="QATitles">Set the video outro</h2>
            <input
                type="text"
                value={VideoOutro}
                onChange={(e) => setVideoOutro(e.target.value)}
                placeholder="Enter Video Outro"
                className="text-input" />
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`download-button ${isDownloading ? 'disabled' : ''}`}>
                {isDownloading ? 'Generating...' : 'Generate Video'}
            </button>
            <div
                id="progressOverlay"
                className="progressOverlay"
                style={{ display: showProgress ? 'block' : 'none' }}>
                <h2 className="progress-title">VIDEO IS BEING GENERATED</h2>
                <progress className="progress-bar" id="progress-bar" value={progressValue}/>
            </div>
        </div>
    );
};

export default redditStory;
