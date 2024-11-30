import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UploadGithubUrl from './pages/UploadGithubUrl';
import AddSubmission from './pages/AddSubmission';
import Home from './pages/Home';

const App = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [repoData, setRepoData] = useState(null);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/upload" replace />} />
                
                <Route
                    path="/upload"
                    element={
                        // <UploadGithubUrl
                        //     onRepoSelect={(url, data) => {
                        //         setRepoUrl(url);
                        //         setRepoData(data);
                        //     }}
                        // />
                        <AddSubmission/>
                    }
                />
                <Route
                    path="/cam-home"
                    element={
                        <Home
                            repoUrl={repoUrl}
                            repoData={repoData}
                        />
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
