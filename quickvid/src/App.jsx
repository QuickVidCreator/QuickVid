import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RedditStory from "./redditstory";
import NormalQuiz from "./NormalQuiz";
import { getVideoLimit, userData as userDataTemp } from "./userInfo";

const App = () => {
    const [videoLimit, setVideoLimit] = useState(null);

    useEffect(() => {
        if (userDataTemp && userDataTemp.id) {
            const fetchLimit = async () => {
                const limit = await getVideoLimit(userDataTemp.id);
                console.log("Fetched video count:", limit);
                setVideoLimit(limit);
            };
            fetchLimit();
        }
    }, [userDataTemp]); // Fetch video limit when userDataTemp changes

    return (
        <Router>
            <div className="App">
                <div className="UserInfo">
                    {userDataTemp ? (
                        <p>Welcome, {userDataTemp.username} (ID: {userDataTemp.id})</p>
                    ) : (
                        <p>Loading user data...</p>
                    )}
                    <p>Daily Videos Left: {videoLimit}</p>
                </div>
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
                    <Route path="/redditstory" element={<RedditStory setVideoLimit={setVideoLimit} />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
