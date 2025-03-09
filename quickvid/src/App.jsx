import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import NormalQuiz from './NormalQuiz';
import RedditStory from './redditstory';

const App = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Listen for messages from the parent WordPress page
        const handleMessage = (event) => {
            // Ensure the message is coming from the expected origin
            if (event.origin !== "https://www.quick-vid.com") return;

            // Check if the message contains user data
            if (event.data && event.data.username) {
                setUserData(event.data);
                console.log("Received user data:", event.data);
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    return (
        <Router>
            <div className="App">
                <h1>QuickVid App</h1>
                {userData ? (
                    <p>Welcome, {userData.username} (ID: {userData.id})</p>
                ) : (
                    <p>Loading user data...</p>
                )}

                <div className="ButtonsClass">
                    <Link to="/sixquestionquiz">
                        <button className="OptionsBtns">
                            <span className="OptionsBtnsTitle">6 Question Quiz</span>
                            <div className="OptionsBtnsStatsContainer">
                                <img src="timerimage.png" width="30" height="30" alt="Timer" />
                            </div>
                            <div className="OptionsBtnsPlatformsContainer">
                                <img src="youtubelogo.png" width="25" height="25" alt="YouTube" />
                                <img src="tiktoklogo.png" width="25" height="25" alt="TikTok" />
                                <img src="instagramlogo.png" width="25" height="25" alt="Instagram" />
                            </div>
                        </button>
                    </Link>
                    <Link to="/redditstory">
                        <button className="OptionsBtns">
                            <span className="OptionsBtnsTitle">Reddit Story</span>
                            <div className="OptionsBtnsStatsContainer">
                                <img src="timerimage.png" width="30" height="30" alt="Timer" />
                            </div>
                            <div className="OptionsBtnsPlatformsContainer">
                                <img src="youtubelogo.png" width="25" height="25" alt="YouTube" />
                                <img src="tiktoklogo.png" width="25" height="25" alt="TikTok" />
                                <img src="instagramlogo.png" width="25" height="25" alt="Instagram" />
                            </div>
                        </button>
                    </Link>
                </div>

                <Routes>
                    <Route path="/sixquestionquiz" element={<NormalQuiz />} />
                    <Route path="/redditstory" element={<RedditStory />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
