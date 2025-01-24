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
            <h1 className="QuestionQuizTitle">6 Question Quiz</h1>
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
            <div className="question-containers">
                <div className="questionQContainers">
                    <h2 className="QATitles">Question 1</h2>
                    <input
                        type="text"
                        value={Question1}
                        onChange={(e) => setQuestion1(e.target.value)}
                        placeholder="Enter the first question"
                        className="text-input" />
                    <br />
                </div>
                <div className="questionAContainers">
                    <h2 className="QATitles">Answer</h2>
                    <input
                        type="text"
                        value={Question1A}
                        onChange={(e) => setQuestion1A(e.target.value)}
                        placeholder="Enter the answer"
                        className="text-input" />
                    <br />
                </div>
            </div>
            <div className="question-containers">
                <div className="questionQContainers">
                    <h2 className="QATitles">Question 2</h2>
                    <input
                        type="text"
                        value={Question2}
                        onChange={(e) => setQuestion2(e.target.value)}
                        placeholder="Enter the second question"
                        className="text-input" />
                    <br />
                </div>
                <div className="questionAContainers">
                    <h2 className="QATitles">Answer</h2>
                    <input
                        type="text"
                        value={Question2A}
                        onChange={(e) => setQuestion2A(e.target.value)}
                        placeholder="Enter the answer"
                        className="text-input" />
                    <br />
                </div>
            </div>
            <div className="question-containers">
                <div className="questionQContainers">
                    <h2 className="QATitles">Question 3</h2>
                    <input
                        type="text"
                        value={Question3}
                        onChange={(e) => setQuestion3(e.target.value)}
                        placeholder="Enter the third question"
                        className="text-input" />
                    <br />
                </div>
                <div className="questionAContainers">
                    <h2 className="QATitles">Answer</h2>
                    <input
                        type="text"
                        value={Question3A}
                        onChange={(e) => setQuestion3A(e.target.value)}
                        placeholder="Enter the answer"
                        className="text-input" />
                    <br />
                </div>
            </div>
            <div className="question-containers">
                <div className="questionQContainers">
                    <h2 className="QATitles">Question 4</h2>
                    <input
                        type="text"
                        value={Question4}
                        onChange={(e) => setQuestion4(e.target.value)}
                        placeholder="Enter the fourth question"
                        className="text-input" />
                    <br />
                </div>
                <div className="questionAContainers">
                    <h2 className="QATitles">Answer</h2>
                    <input
                        type="text"
                        value={Question4A}
                        onChange={(e) => setQuestion4A(e.target.value)}
                        placeholder="Enter the answer"
                        className="text-input" />
                    <br />
                </div>
            </div>
            <div className="question-containers">
                <div className="questionQContainers">
                    <h2 className="QATitles">Question 5</h2>
                    <input
                        type="text"
                        value={Question5}
                        onChange={(e) => setQuestion5(e.target.value)}
                        placeholder="Enter the fifth question"
                        className="text-input" />
                    <br />
                </div>
                <div className="questionAContainers">
                    <h2 className="QATitles">Answer</h2>
                    <input
                        type="text"
                        value={Question5A}
                        onChange={(e) => setQuestion5A(e.target.value)}
                        placeholder="Enter the answer"
                        className="text-input" />
                    <br />
                </div>
            </div>
            <div className="question-containers">
                <div className="questionQContainers">
                    <h2 className="QATitles">Question 6</h2>
                    <input
                        type="text"
                        value={Question6}
                        onChange={(e) => setQuestion6(e.target.value)}
                        placeholder="Enter the sixth question"
                        className="text-input" />
                    <br />
                </div>
                <div className="questionAContainers">
                    <h2 className="QATitles">Answer</h2>
                    <input
                        type="text"
                        value={Question6A}
                        onChange={(e) => setQuestion6A(e.target.value)}
                        placeholder="Enter the answer"
                        className="text-input" />
                    <br />
                </div>
            </div>
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
