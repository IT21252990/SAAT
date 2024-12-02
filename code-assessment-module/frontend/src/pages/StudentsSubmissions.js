import React, { useEffect, useState } from "react";
import axios from "axios";
import SubmissionCard from "../components/SubmissionCard";

const StudentsSubmissions = ({onRepoSelect}) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/projects`);
                setSubmissions(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching submissions:", error);
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    const pageStyle = {
        padding: "20px",
        backgroundColor: "#f3f4f6",
        minHeight: "100vh",
        fontFamily: "'Arial', sans-serif",
    };

    const headerStyle = {
        textAlign: "center",
        fontSize: "28px",
        color: "#333",
        marginBottom: "20px",
    };

    const submissionsContainerStyle = {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        scrollbars: "auto",
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1 style={headerStyle}>Loading Submissions...</h1>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <h1 style={headerStyle}>Students' Submissions</h1>
            <div style={submissionsContainerStyle}>
                {submissions.map((submission, index) => (
                    <SubmissionCard key={index} submission={submission} onRepoSelect={onRepoSelect} />
                ))}
            </div>
        </div>
    );
};

export default StudentsSubmissions;