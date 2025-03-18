import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase";

const AddSubmissionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { assignmentId } = useParams();
  const { moduleId, moduleName } = location.state || {}; // Retrieve passed state

  // State variables
  const [githubUrl, setGithubUrl] = useState(""); // State for GitHub URL
  const [videoDocId, setVideoDocId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    // Retrieve the GitHub URL from localStorage when the component mounts
    const storedData = JSON.parse(localStorage.getItem(assignmentId)) || {};
    console.log(assignmentId)
    if (storedData.githubUrl) {
      setGithubUrl(storedData.githubUrl);
    }
    if (storedData.videoDocId) {
      setVideoDocId(storedData.videoDocId);
    }
  }, [assignmentId]);

  const handleGithubUrlChange = (e) => {
    const newGithubUrl = e.target.value;
    setGithubUrl(newGithubUrl);

    // Retrieve existing data for the assignmentId, if any
    const existingData = JSON.parse(localStorage.getItem(assignmentId)) || {};

    // Update the data with the new GitHub URL
    const updatedData = {
      ...existingData,
      githubUrl: newGithubUrl,
    };

    // Store the updated data back in localStorage
    localStorage.setItem(assignmentId, JSON.stringify(updatedData));
  };

  // Handle Save action
  const handleSaveClick = async () => {
    if (!githubUrl) {
      setError("GitHub URL is required.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create the submission (without submission ID for now)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          student_id: localStorage.getItem("userId"),
          video_id: videoDocId || null,
        }),
      });

      const submissionData = await response.json();
      if (response.ok) {
        const submissionId = submissionData.submission_id;

        // Step 2: Save GitHub URL and retrieve the code ID
        const codeId = await saveGithubUrl(submissionId, githubUrl);

        // Step 3: Update the submission with the code ID
        await updateSubmissionWithCodeId(submissionId, codeId);

        // Step 4: If videoDocId is not null, update the videos collection
        if (videoDocId) {
          const videoDocRef = doc(firestore, "videos", videoDocId);
          await updateDoc(videoDocRef, {
            submissionId: submissionId,
          });
        }

        setLoading(false);
        // After saving the code ID, navigate to the submission view page
        navigate(-1);
      } else {
        setError(submissionData.error || "Failed to create repo submission!");
      }
    } catch (error) {
      setError("Failed to create repo submission: " + error.message);
      setLoading(false);
    }
  };

  // Save GitHub URL to the database and return the code ID
  const saveGithubUrl = async (submissionId, githubUrl) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/add-repo-submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          github_url: githubUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        return data.code_id;  // Return the code ID after successfully saving the GitHub URL
      } else {
        throw new Error(data.error || "Failed to save GitHub URL!");
      }
    } catch (error) {
      throw new Error("Error saving GitHub URL: " + error.message);
    }
  };

  // Update the submission with the code ID
  const updateSubmissionWithCodeId = async (submissionId, codeId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submission_id: submissionId,
          code_id: codeId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update submission with code ID!");
      }
    } catch (error) {
      throw new Error("Error updating submission: " + error.message);
    }
  };

  const handleVideoNavigation = () => {
    navigate(`/videoSubmission/${assignmentId}`, {
      state: { moduleId, moduleName },
    });
  };

  return (
    <div className="container">
      <h2>Add Submission</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form>
        <div>
          <label>GitHub Repository URL</label>
          <input
            type="text"
            placeholder="Enter GitHub URL..."
            value={githubUrl}
            onChange={handleGithubUrlChange}
          />
        </div>

        <div>
          <label>Report</label>
        </div>

        <div>
          <label>Video</label>
          {videoDocId ? (
            <p>Video Document ID: {videoDocId}</p>
          ) : (
            <button type="button" onClick={handleVideoNavigation}>
              Upload
            </button>
          )}
        </div>

        <button type="button" onClick={handleSaveClick} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/assignment/${assignmentId}`)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddSubmissionPage;
