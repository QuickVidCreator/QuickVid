import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Added useState & useEffect
import './App.css';
import NormalQuiz from './NormalQuiz';
import RedditStory from './redditstory'; // Make sure you import the RedditStory component

const App = () => {
    const [userData, setUserData] = useState(null);
    useEffect(() => {
        const handleMessage = (event) => {
            console.log("Message received from:", event.origin);
            console.log("Message data:", event.data);

            // Send log back to the parent (WordPress) for debugging
            window.parent.postMessage(
                { log: "Message received", origin: event.origin, data: event.data },
                "*"
            );

            // Ensure we only accept messages from the WordPress site
            if (event.origin !== "https://quick-vid.com") return;

            if (event.data && event.data.username) {
                setUserData(event.data);
                console.log("? Received user data:", event.data);

                // Also send confirmation back to WordPress
                window.parent.postMessage(
                    { log: "User data set successfully", data: event.data },
                    "*"
                );
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

                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="ButtonsClass">
                                <Link to="/sixquestionquiz">
                                    <button className="OptionsBtns">
                                        <span className="OptionsBtnsTitle">6 Question Quiz</span>
                                        <div className="OptionsBtnsStatsContainer">
                                            <img src="timerimage.png" width="30" height="30" />
                                        </div>
                                        <div className="OptionsBtnsPlatformsContainer">
                                            <img src="youtubelogo.png" width="25" height="25" />
                                            <img src="tiktoklogo.png" width="25" height="25" />
                                            <img src="instagramlogo.png" width="25" height="25" />
                                        </div>
                                    </button>
                                </Link>
                                <Link to="/redditstory">
                                    <button className="OptionsBtns">
                                        <span className="OptionsBtnsTitle">Reddit Story</span>
                                        <div className="OptionsBtnsStatsContainer">
                                            <img src="timerimage.png" width="30" height="30" />
                                        </div>
                                        <div className="OptionsBtnsPlatformsContainer">
                                            <img src="youtubelogo.png" width="25" height="25" />
                                            <img src="tiktoklogo.png" width="25" height="25" />
                                            <img src="instagramlogo.png" width="25" height="25" />
                                        </div>
                                    </button>
                                </Link>
                            </div>
                        }
                    />
                    <Route path="/sixquestionquiz" element={<NormalQuiz />} />
                    <Route path="/redditstory" element={<RedditStory />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
