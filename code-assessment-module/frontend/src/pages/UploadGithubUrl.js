import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadGithubUrl = ({ onRepoSelect }) => {
    const [repoUrl, setRepoUrl] = useState('');
    const navigate = useNavigate(); // React Router hook for navigation

    const handleFetchRepo = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/repo/repo-details`, {
                params: { repo_url: repoUrl },
            });
            onRepoSelect(repoUrl, response.data); // Pass repo data to parent
            navigate('/cam-home'); // Navigate to Home page
        } catch (error) {
            console.error('Error fetching repository:', error);
            alert('Failed to fetch the repository. Please check the URL.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Enter GitHub Repository URL</h2>
            <input
                type="text"
                placeholder="GitHub Repository URL"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                style={{
                    padding: '10px',
                    width: '80%',
                    marginBottom: '10px',
                    fontSize: '16px',
                }}
            />
            <button
                onClick={handleFetchRepo}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                Fetch Repository
            </button>
        </div>
    );
};

export default UploadGithubUrl;
