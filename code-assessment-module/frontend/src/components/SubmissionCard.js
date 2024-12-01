import React from "react";

const SubmissionCard = ({ submission }) => {
    const cardStyle = {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        margin: "10px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        textAlign: "left",
        fontFamily: "'Arial', sans-serif",
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
        fontSize: "12px",
    };

    return (
        <div style={cardStyle}>
            <h2 style={titleStyle}>{submission.student_name} ({submission.student_id})</h2>
            <p style={detailStyle}>Year: {submission.year}</p>
            <p style={detailStyle}>Semester: {submission.semester}</p>
            <p style={detailStyle}>Module: {submission.module_name} ({submission.module_code})</p>
            <a href={submission.github_url} style={linkStyle} target="_blank" rel="noopener noreferrer">
            {submission.github_url}
            </a>
        </div>
    );
};

export default SubmissionCard;
