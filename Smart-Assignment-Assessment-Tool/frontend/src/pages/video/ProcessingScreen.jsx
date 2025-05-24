import React from "react";

function ProcessingScreen({ progress, assignmentId, moduleId, userId }) {
  return (
    <div style={styles.container}>
      <h2>Processing Video...</h2>
      <div style={styles.progressBar}>
        <div style={{ ...styles.progress, width: `${progress}%` }}></div>
      </div>
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
