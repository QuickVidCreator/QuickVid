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
                                        <div className="OptionsBtnsVMContainer">
                                            <span className="circle"></span>
                                            <span className="OptionsBtnsVM">5/10</span>
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