import { useState } from 'react';
import './redditstory.css'; // Import the CSS file

const redditStory = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [videoStartTime, setVideoStartTime] = useState('');
    const [VideoTitle, setVideoTitle] = useState('');
    const [VideoHook, setVideoHook] = useState('');
    const [VideoText, setVideoText] = useState(''); // Updated variable name for user input
    const [VideoOutro, setVideoOutro] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

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

        try {
            const response = await fetch('https://75.135.157.2:3000/download', {
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
        } catch (error) {
            console.error('Error during download:', error);
            alert('An error occurred while downloading the video.');
        } finally {
            setIsDownloading(false);
        }
    };




    return (
        <div className="quiz-container">
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
                {isDownloading ? 'Downloading...' : 'Download Video'}
            </button>
        </div>
    );
};

export default redditStory;
