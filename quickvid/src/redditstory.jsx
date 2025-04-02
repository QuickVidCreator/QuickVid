//import { useState } from 'react';
import { useState, useEffect } from 'react';

import './redditstory.css'; // Import the CSS file
import './global.css';
import { getVideoLimit } from './Functions/userInfo.js';
import { updateVideoLimit } from './Functions/userInfo.js';
import { progressBarFunction } from "./Functions/progressBar.js";


let videoBtnSet = true;


// Call the function to get the video limit
//getVideoLimit();
const redditStory = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoStartTime, setVideoStartTime] = useState('');
    const [VideoTitle, setVideoTitle] = useState('');
    const [VideoText, setVideoText] = useState(''); // Updated variable name for user input
    const [isDownloading, setIsDownloading] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [progressValue, setProgressValue] = useState(false);

    const [videoLimit, setVideoLimit] = useState(null);
    //const userId = 2; // Replace with dynamic user ID if needed

    useEffect(() => {
        const fetchVideoLimit = async () => {
            const limit = await getVideoLimit();
            console.log("Fetched video count:", limit);
            setVideoLimit(limit);
            if (limit == 0) {
                videoBtnSet = false;
            }
        };

        fetchVideoLimit();
    }, []);

    if (videoLimit === null) {
        return <p>Loading video count...</p>; // Prevents incorrect early check
    }

    const handleDownload = async () => {
        //updateVideoLimit();
        if (!videoUrl) {
            alert('Please enter a valid YouTube URL');
            return;
        }
        if (!VideoTitle) {
            alert('Please enter a valid video title');
            return;
        }
        setIsDownloading(true);
        progressBarFunction(setShowProgress, setProgressValue);

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
                    VideoText,
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
            updateVideoLimit();
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


    return (
        <div className="quiz-container">
            <button onClick={handleDownload} className="back-button">Back</button>
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
            {/*<h2 className="QATitles">Set the video hook</h2>*/}
            {/*<input*/}
            {/*    type="text"*/}
            {/*    value={VideoHook}*/}
            {/*    onChange={(e) => setVideoHook(e.target.value)}*/}
            {/*    placeholder="Enter Video Hook"*/}
            {/*    className="text-input" />*/}
            {/*<br />*/}
            <h2 className="QATitles">Set the reddit story text (Limit of 160)</h2>
            <textarea
                type="text"
                rows="6"
                value={VideoText}
                onChange={(e) => setVideoText(e.target.value)}
                placeholder="Enter Reddit Story Text"
                className="text-input" />
            {/*<h2 className="QATitles">Set the video outro</h2>*/}
            {/*<input*/}
            {/*    type="text"*/}
            {/*    value={VideoOutro}*/}
            {/*    onChange={(e) => setVideoOutro(e.target.value)}*/}
            {/*    placeholder="Enter Video Outro"*/}
            {/*    className="text-input" />*/}
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
