import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AddSubmission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { submissionId } = location.state || {};
  const [github_url, setGithub_url] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/repo/add-repo-submission`, {
        method: "POST",
        body: JSON.stringify({ github_url:github_url, submission_id: submissionId }),
        headers: { "Content-Type": "application/json" },
      });

      navigate(-1);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div>
        <h2>Add Project repo URL..</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter GitHub URL..."
        onChange={(e) => setGithub_url(e.target.value)}
        required
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </form>
    </div>
    
  );
};

export default AddSubmission;
