import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [questions, setQuestions] = useState([]);

  const fetchQuestions = async () => {
    const response = await axios.post('http://127.0.0.1:5000/generate-question', {
      submission: "Sample submission data"
    });
    setQuestions(response.data.questions);
  };

  return (
    <div>
      <h1>Question Generator</h1>
      <button onClick={fetchQuestions}>Generate Questions</button>
      <ul>
        {questions.map((q, index) => (
          <li key={index}>{q}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
