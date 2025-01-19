//import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import NormalQuiz from './NormalQuiz';

const App = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div>
                                <h1>QuickTok</h1>
                                <Link to="/feature">
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
                            </div>
                        }
                    />
                    <Route path="/feature" element={<NormalQuiz />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;