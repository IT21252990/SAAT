import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import SubmissionMethod from './pages/SubmissionMethod';
import UploadGithubUrl from './pages/UploadGithubUrl';
import AddSubmission from './pages/AddSubmission';
import StudentsSubmissions from './pages/StudentsSubmissions';
import Home from './pages/Home';

const App = () => {
    const [repoUrl, setRepoUrl] = useState('');
    const [repoData, setRepoData] = useState(null);

    return (
        <Router>
            <Routes>
                <Route 
                    path='/' 
                    element={<WelcomePage/>}
                />
                <Route
                    path='/submisson-type'
                    element={<SubmissionMethod/>}
                />
                <Route 
                    path='/upload-submission' 
                    element={<AddSubmission/>}
                />
                <Route 
                    path='/students-submissions' 
                    element={
                        <StudentsSubmissions   
                            onRepoSelect={(url, data) => {
                                setRepoUrl(url);
                                setRepoData(data);
                            }}
                        />
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
