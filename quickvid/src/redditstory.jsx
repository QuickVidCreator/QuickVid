import { useState } from 'react';
import './redditstory.css'; // Import the CSS file
import './global.css';

let videoBtnSet = true;
const getVideoLimit = async (userId) => {
    try {
        const response = await fetch(`https://quick-vid.com/wp-json/custom/v1/videoCount/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await response.json();

        return data.videoCount ?? 0; // Return the video count or 0 if undefined
    } catch (error) {
        console.error('Error fetching video count:', error);
        return null;
    }
};

const updateVideoLimit = async (userId) => {
    try {
        const response = await fetch(`https://quick-vid.com/wp-json/custom/v1/videoCount/${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await response.json();

        if (data.success) {
            console.log('Videos remaining:', data.videoCount);
            return data.videoCount;
        } else {
            console.error('Error updating count:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error updating video count:', error);
        return null;
    }
};


// Call the function to get the video limit
//getVideoLimit();
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

    const remainingVideos = getVideoLimit(4);
    if (remainingVideos > 0) {
        // Proceed with video generation
        console.log(`Generated video. ${remainingVideos} videos remaining.`);
    } else {
        // Show error - no videos left
        console.log('No videos remaining today');
        videoBtnSet = false;
    }

    const handleDownload = async () => {
        updateVideoLimit(4);
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
            <h2 className="QATitles" disabled={videoBtnSet} >Set the video outro</h2>
            <button
                onClick={handleDownload}
                disabled={isDownloading || !videoBtnSet}
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
