import React from "react";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {

    const navigate = useNavigate();


    // Inline styles
    const pageStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "'Arial', sans-serif",
    };

    const headerStyle = {
        fontSize: "36px",
        color: "#333",
        marginBottom: "40px",
        fontWeight: "bold",
    };

    const buttonContainerStyle = {
        display: "flex",
        gap: "20px",
    };

    const buttonStyle = {
        padding: "15px 30px",
        fontSize: "18px",
        color: "white",
        backgroundColor: "#50c5ff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        transition: "transform 0.2s, background-color 0.2s",
    };

    const buttonHoverStyle = {
        ...buttonStyle,
        backgroundColor: "#489fcb",
        transform: "scale(1.05)",
    };

    // Hover effect handler
    const [hoveredButton, setHoveredButton] = React.useState(null);

    return (
        <div style={pageStyle}>
            <h1 style={headerStyle}>Code Assessment Platform</h1>
            <div style={buttonContainerStyle}>
                <button
                    style={hoveredButton === "add" ? buttonHoverStyle : buttonStyle}
                    onMouseEnter={() => setHoveredButton("add")}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => navigate("/submission-type")}
                >
                    Add Submission
                </button>
                <button
                    style={hoveredButton === "review" ? buttonHoverStyle : buttonStyle}
                    onMouseEnter={() => setHoveredButton("review")}
                    onMouseLeave={() => setHoveredButton(null)}
                    onClick={() => navigate("/students-submissions")}
                >
                    Review Submission
                </button>
            </div>
        </div>
    );
};

export default WelcomePage;
