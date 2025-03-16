import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AddSubmissionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assignmentId, moduleId, moduleName } = location.state || {}; // Retrieve passed state

  const [code, setCode] = useState(null);
  const [report, setReport] = useState(null);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveClick = async () => {
    if (!code && !report && !video) {
      setError("At least one submission is required (code, report, or video).");
      return;
    }

    setLoading(true);
    try {
      // Create the submission (without submission ID for now)
      const response = await fetch("http://127.0.0.1:5000/submission/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          student_id: localStorage.getItem("userId"),
        }),
      });

      const submissionData = await response.json();
      if (response.ok) {
        const submissionId = submissionData.submission.submission_id;

        // Handle file uploads (code, report, video)
        const formData = new FormData();
        formData.append("submission_id", submissionId);
        
        if (code) formData.append("code", code);
        if (report) formData.append("report", report);
        if (video) formData.append("video", video);

        // Save code, report, and video files using their respective routes
        if (code) {
          await uploadFile("http://127.0.0.1:5000/submission/save-code", formData);
        }
        if (report) {
          await uploadFile("http://127.0.0.1:5000/submission/save-report", formData);
        }
        if (video) {
          await uploadFile("http://127.0.0.1:5000/submission/save-video", formData);
        }

        setLoading(false);

        // After saving the files, navigate to the submission view page
        navigate(`/view-submission/${submissionId}`);
      } else {
        setError(submissionData.error || "Failed to create submission!");
      }
    } catch (error) {
      setError("Failed to create submission: " + error.message);
      setLoading(false);
    }
  };

  const uploadFile = async (url, formData) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const fileData = await response.json();
      if (!response.ok) {
        throw new Error(fileData.error || "File upload failed!");
      }
    } catch (error) {
      throw new Error("Error uploading file: " + error.message);
    }
  };

  return (
    <div className="container">
      <h2>Add Submission</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form>
        <div>
          <label>Code Submission</label>
          <input
            type="file"
            onChange={(e) => setCode(e.target.files[0])}
            accept=".zip,.js,.py,.java"
          />
        </div>
        <div>
          <label>Report Submission</label>
          <input
            type="file"
            onChange={(e) => setReport(e.target.files[0])}
            accept=".pdf,.docx"
          />
        </div>
        <div>
          <label>Video Submission</label>
          <input
            type="file"
            onChange={(e) => setVideo(e.target.files[0])}
            accept="video/*"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveClick}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => navigate(`/assignment/${assignmentId}`)}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddSubmissionPage;
