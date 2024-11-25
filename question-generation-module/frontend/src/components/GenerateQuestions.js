import React, { useState } from "react";
import axios from "axios";

const GenerateQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateQuestions = async (type) => {
    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/generate-question", {
        type: type,
        submission: "Sample submission content for testing", // Replace with actual content
      });
      setQuestions(response.data.questions);
    } catch (err) {
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Generate Viva Questions</h2>
      <button onClick={() => handleGenerateQuestions("code")}>Generate from Code</button>
      <button onClick={() => handleGenerateQuestions("report")}>Generate from Report</button>
      <button onClick={() => handleGenerateQuestions("video")}>Generate from Video</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {questions.length > 0 && (
        <div>
          <h3>Generated Questions:</h3>
          <ul>
            {questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GenerateQuestions;
