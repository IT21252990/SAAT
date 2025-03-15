import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import axios from 'axios';

const SubmissionCard = ({ submission , onRepoSelect}) => {
    const navigate = useNavigate(); // Hook for navigation

    const handleFetchRepo = async () => {
        if(!submission.github_url){
            navigate('/cam-home'); 
       }else{
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/repo/repo-details`, {
                params: { repo_url: submission.github_url },
            });
            onRepoSelect(submission.github_url, response.data); // Pass repo data to parent
            navigate('/cam-home'); // Navigate to Home page
        } catch (error) {
            console.error('Error fetching repository:', error);
            alert('Failed to fetch the repository. Please check the URL.');
        }
       }   
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
        };
        return date.toLocaleString("en-US", options);
    };

    const cardStyle = {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        margin: "10px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        width: "90%",
        fontFamily: "'Arial', sans-serif",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    };

    const leftSectionStyle = {
        textAlign: "left",
        flex: 1,
    };

    const titleStyle = {
        fontSize: "20px",
        fontWeight: "bold",
        color: "#333",
        marginBottom: "10px",
    };

    const detailStyle = {
        fontSize: "16px",
        marginBottom: "8px",
        color: "#555",
    };

    const linkStyle = {
        color: "#50c5ff",
        textDecoration: "none",
        fontWeight: "bold",
        fontSize: "14px",
    };

    const buttonStyle = {
        padding: "10px 20px",
        backgroundColor: "#0078d4",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
    };

    const rightSectionStyle = {
        textAlign: "right",
        fontSize: "14px",
        color: "#777",
    };

    const dateStyle = {
        fontWeight: "bold",
        fontSize: "12px",
        color: "#444",
    };

    return (
        <div style={cardStyle}>
            <div style={leftSectionStyle}>
                <h2 style={titleStyle}>
                    {submission.student_name} ({submission.student_id})
                </h2>
                <p style={detailStyle}>Year: {submission.year}</p>
                <p style={detailStyle}>Semester: {submission.semester}</p>
                <p style={detailStyle}>
                    Module: {submission.module_name} ({submission.module_code})
                </p>
                <a
                    href={submission.github_url}
                    style={linkStyle}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {submission.github_url}
                </a>
            </div>
            <div style={rightSectionStyle}>
                <p style={dateStyle}>Uploaded:</p>
                <p>{formatDateTime(submission.created_at)}</p>
                <button
                    style={buttonStyle}
                    onClick={handleFetchRepo}
                >
                    Review
                </button>
            </div>
        </div>
    );
};

export default SubmissionCard;
