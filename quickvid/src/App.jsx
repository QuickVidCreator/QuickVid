import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import NormalQuiz from './NormalQuiz';
import RedditStory from './redditstory'; // Make sure you import the RedditStory component

const App = () => {

    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className="ButtonsClass"> {/* Removed Link wrapper, will use individual Links */}
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