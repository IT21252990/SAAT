import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [questions, setQuestions] = useState([]);
  const [submissionType, setSubmissionType] = useState('');

  const fetchQuestions = async (type) => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/generate-question', {
        type: type, // Pass the submission type (code, report, video)
        submission: "Sample submission data" // Replace this with actual data when integrating
      });
      setQuestions(response.data.questions);
      setSubmissionType(type);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Question Generator</h1>
      <div>
        <button onClick={() => fetchQuestions('code')}>Generate Questions for Code</button>
        <button onClick={() => fetchQuestions('report')}>Generate Questions for Report</button>
        <button onClick={() => fetchQuestions('video')}>Generate Questions for Video</button>
      </div>
      <h2>Generated Questions ({submissionType})</h2>
      <ul>
        {questions.map((q, index) => (
          <li key={index}>{q}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
