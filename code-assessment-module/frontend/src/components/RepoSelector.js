import React, { useState } from 'react';
import axios from 'axios';

const RepoSelector = ({ onRepoSelect }) => {
    const [owner, setOwner] = useState('');
    const [repo, setRepo] = useState('');

    const handleFetchRepo = async () => {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/repo/repo-details`, {
            params: { owner, repo },
        });
        onRepoSelect(response.data);
    };

    return (
        <div>
            <h2>Select a Repository</h2>
            <input placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
            <input placeholder="Repository" value={repo} onChange={(e) => setRepo(e.target.value)} />
            <button onClick={handleFetchRepo}>Fetch Repo</button>
        </div>
    );
};

export default RepoSelector;
