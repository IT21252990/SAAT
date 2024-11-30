import React, { useEffect, useState } from "react";
import axios from "axios";
import SubmissionCard from "../components/SubmissionCard";

const StudentsSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get("http://localhost:5000/submissions");
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
                    <SubmissionCard key={index} submission={submission} />
                ))}
            </div>
        </div>
    );
};

export default StudentsSubmissions;
