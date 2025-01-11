import { useState } from 'react';
import './NormalQuiz.css'; // Import the CSS file

const NormalQuiz = () => {
    const [videoUrl, setVideoUrl] = useState('');
    const [VideoTitle, setVideoTitle] = useState('');
    const [VideoHook, setVideoHook] = useState('');
    const [Question1, setQuestion1] = useState(''); // Updated variable name for user input
    const [Question1A, setQuestion1A] = useState(''); // Updated variable name for user input
    const [Question2, setQuestion2] = useState(''); // Updated variable name for user input
    const [Question2A, setQuestion2A] = useState(''); // Updated variable name for user input
    const [Question3, setQuestion3] = useState(''); // Updated variable name for user input
    const [Question3A, setQuestion3A] = useState(''); // Updated variable name for user input
    const [Question4, setQuestion4] = useState(''); // Updated variable name for user input
    const [Question4A, setQuestion4A] = useState(''); // Updated variable name for user input
    const [Question5, setQuestion5] = useState(''); // Updated variable name for user input
    const [Question5A, setQuestion5A] = useState(''); // Updated variable name for user input
    const [Question6, setQuestion6] = useState(''); // Updated variable name for user input
    const [Question6A, setQuestion6A] = useState(''); // Updated variable name for user input
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
        if (!Question1 || !Question1A || !Question2 || !Question2A || !Question3 || !Question3A || !Question4 || !Question4A || !Question5 || !Question5A || !Question6 || !Question6A) {
            alert('One or more of your questions or answers are not valid');
            return;
        }
        if (!VideoOutro) {
            alert('Please enter a valid video outro');
            return;
        }
        setIsDownloading(true);

        try {
            // Trigger the download by navigating to the server's /download endpoint with the video URL and Question1 input
            //window.location.href = `http://75.135.157.2:3000/download?url=${encodeURIComponent(videoUrl)}&VideoTitle=${encodeURIComponent(VideoTitle)}&VideoHook=${encodeURIComponent(VideoHook)}&Question1=${encodeURIComponent(Question1)}&Question1A=${encodeURIComponent(Question1A)}&Question2=${encodeURIComponent(Question2)}&Question2A=${encodeURIComponent(Question2A)}&Question3=${encodeURIComponent(Question3)}&Question3A=${encodeURIComponent(Question3A)}&Question4=${encodeURIComponent(Question4)}&Question4A=${encodeURIComponent(Question4A)}&Question5=${encodeURIComponent(Question5)}&Question5A=${encodeURIComponent(Question5A)}&Question6=${encodeURIComponent(Question6)}&Question6A=${encodeURIComponent(Question6A)}&VideoOutro=${encodeURIComponent(VideoOutro)}`;
            //const response = await fetch(`http://75.135.157.2:3000/download?url=${encodeURIComponent(videoUrl)}&VideoTitle=${encodeURIComponent(VideoTitle)}&VideoHook=${encodeURIComponent(VideoHook)}&Question1=${encodeURIComponent(Question1)}&Question1A=${encodeURIComponent(Question1A)}&Question2=${encodeURIComponent(Question2)}&Question2A=${encodeURIComponent(Question2A)}&Question3=${encodeURIComponent(Question3)}&Question3A=${encodeURIComponent(Question3A)}&Question4=${encodeURIComponent(Question4)}&Question4A=${encodeURIComponent(Question4A)}&Question5=${encodeURIComponent(Question5)}&Question5A=${encodeURIComponent(Question5A)}&Question6=${encodeURIComponent(Question6)}&Question6A=${encodeURIComponent(Question6A)}&VideoOutro=${encodeURIComponent(VideoOutro)}`);
            //window.location.href = `http://localhost:4000/download?url=${encodeURIComponent(videoUrl)}&VideoTitle=${encodeURIComponent(VideoTitle)}&VideoHook=${encodeURIComponent(VideoHook)}&Question1=${encodeURIComponent(Question1)}&Question1A=${encodeURIComponent(Question1A)}&Question2=${encodeURIComponent(Question2)}&Question2A=${encodeURIComponent(Question2A)}&Question3=${encodeURIComponent(Question3)}&Question3A=${encodeURIComponent(Question3A)}&Question4=${encodeURIComponent(Question4)}&Question4A=${encodeURIComponent(Question4A)}&Question5=${encodeURIComponent(Question5)}&Question5A=${encodeURIComponent(Question5A)}&Question6=${encodeURIComponent(Question6)}&Question6A=${encodeURIComponent(Question6A)}&VideoOutro=${encodeURIComponent(VideoOutro)}`;
            //window.location.href = `https://quickvidserver.vercel.app/download?url=${encodeURIComponent(videoUrl)}&VideoTitle=${encodeURIComponent(VideoTitle)}&VideoHook=${encodeURIComponent(VideoHook)}&Question1=${encodeURIComponent(Question1)}&Question1A=${encodeURIComponent(Question1A)}&Question2=${encodeURIComponent(Question2)}&Question2A=${encodeURIComponent(Question2A)}&Question3=${encodeURIComponent(Question3)}&Question3A=${encodeURIComponent(Question3A)}&Question4=${encodeURIComponent(Question4)}&Question4A=${encodeURIComponent(Question4A)}&Question5=${encodeURIComponent(Question5)}&Question5A=${encodeURIComponent(Question5A)}&Question6=${encodeURIComponent(Question6)}&Question6A=${encodeURIComponent(Question6A)}&VideoOutro=${encodeURIComponent(VideoOutro)}`;
            //window.location.href = `https://quickvid.onrender.com/download?url=${encodeURIComponent(videoUrl)}&VideoTitle=${encodeURIComponent(VideoTitle)}&VideoHook=${encodeURIComponent(VideoHook)}&Question1=${encodeURIComponent(Question1)}&Question1A=${encodeURIComponent(Question1A)}&Question2=${encodeURIComponent(Question2)}&Question2A=${encodeURIComponent(Question2A)}&Question3=${encodeURIComponent(Question3)}&Question3A=${encodeURIComponent(Question3A)}&Question4=${encodeURIComponent(Question4)}&Question4A=${encodeURIComponent(Question4A)}&Question5=${encodeURIComponent(Question5)}&Question5A=${encodeURIComponent(Question5A)}&Question6=${encodeURIComponent(Question6)}&Question6A=${encodeURIComponent(Question6A)}&VideoOutro=${encodeURIComponent(VideoOutro)}`;
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

export default NormalQuiz;
