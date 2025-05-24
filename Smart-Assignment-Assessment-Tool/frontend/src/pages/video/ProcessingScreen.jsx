import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

function ProcessingScreen({ progress, assignmentId, moduleId, userId, showNavigate }) {
  
  const navigate = useNavigate();

  const handleVideoNavigation = () => {
    navigate(`/add-submission/${assignmentId}`, {
      state: { moduleId, moduleName, submissionId },
    });
  };

  return (
    <div style={styles.container}>
      <h2>Processing Video...</h2>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progress, width: `${progress}%` }}></div>
      </div>
      { showNavigate &&  (
              <button onClick={handleVideoNavigation}>Go to Assignment</button>
            )}
      <p>{progress}% Completed</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
  },
  progressBar: {
    width: "80%",
    height: "30px",
    backgroundColor: "#ddd",
    margin: "20px auto",
    borderRadius: "5px",
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: "#6200ee",
    transition: "width 0.5s",
  },
};

export default ProcessingScreen;
