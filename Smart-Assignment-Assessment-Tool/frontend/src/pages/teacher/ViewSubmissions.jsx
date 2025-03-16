import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios"; // Make sure to import axios

const ViewSubmissions = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [github_url, setGithub_url] = useState("");
  const [codeId, setCodeId] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState({});
  const navigate = useNavigate();

  // Function to fetch user email using student ID
  const fetchUserEmail = async (uid) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/getUser/${uid}`);
      const data = await response.json();
      if (response.ok) {
        return data.email; // assuming the email is under the 'email' field
      } else {
        throw new Error(data.error || "Failed to fetch user.");
      }
    } catch (error) {
      setError("Error fetching user data: " + error.message);
      return null;
    }
  };

  // Fetch the GitHub URL by code_id
  const getRepoUrl = async (codeId) => {
    try {
      // Fetch the GitHub URL by code_id from the backend
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/repo/get-github-url`, {
        params: { code_id: codeId },
      });
  
      if (response.status === 200) {
        const githubUrl = response.data.github_url; // Get the GitHub URL from the response
        setGithub_url(githubUrl); // Store it in state
  
        // Once GitHub URL is fetched, proceed with handleFetchRepo
        await handleFetchRepo(githubUrl, codeId);
      } else {
        setError("GitHub URL not found for this submission.");
      }
    } catch (error) {
      console.error("Error fetching GitHub URL:", error);
      setError("Failed to fetch the GitHub URL.");
    }
  };
  
  const handleFetchRepo = async (githubUrl, codeId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/repo/repo-details`, {
        params: { repo_url: githubUrl },
      });
  
      if (response.status === 200) {
        // Navigate to view-code page and pass githubUrl as state
        navigate(`/view-code/${codeId}`, { state: { githubUrl, repoDetails: response.data } });
      } else {
        alert("Failed to fetch repository details.");
      }
    } catch (error) {
      console.error("Error fetching repository:", error);
      alert("Failed to fetch the repository. Please check the URL.");
    }
  };
  
  
  

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionsByAssignment/${assignmentId}`
        );
        const data = await response.json();

        if (response.ok) {
          const submissionsWithEmails = await Promise.all(
            data.submissions.map(async (submission) => {
              // Fetch email for each submission's student_id
              const email = await fetchUserEmail(submission.student_id);
              setCodeId(submission.code_id);
              return { ...submission, email };
            })
          );
          setSubmissions(submissionsWithEmails);
        } else {
          setError(data.error || "Failed to fetch submissions.");
        }
      } catch (error) {
        setError("Error fetching submissions: " + error.message);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  return (
    <div className="container">
      <h2>Student Submissions</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {submissions.length > 0 ? (
        <table border="1" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Student Email</th>
              <th>Submitted Time</th>
              <th>View Submission</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission, index) => (
              <tr key={submission.submission_id}>
                <td>{index + 1}</td> {/* Display submission number */}
                <td>{submission.email}</td> {/* Display student email */}
                <td>{new Date(submission.created_at).toLocaleString()}</td> {/* Format the submitted time */}
                <td>
                  {/* View Code Submission */}
                  {submission.code_id && (
                    <button
                      style={{
                        padding: "5px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "3px",
                        marginRight: "5px",
                      }}
                      onClick={() => getRepoUrl(submission.code_id)} // Fix here
                    >
                      View Code
                    </button>
                  )}

                  {/* View Report Submission */}
                  {submission.report_id && (
                    <button
                      style={{
                        padding: "5px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "3px",
                        marginRight: "5px",
                      }}
                      onClick={() =>
                        navigate(`/view-report/${submission.report_id}`)
                      }
                    >
                      View Report
                    </button>
                  )}

                  {/* View Video Submission */}
                  {submission.video_id && (
                    <button
                      style={{
                        padding: "5px",
                        backgroundColor: "#ffc107",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "3px",
                      }}
                      onClick={() =>
                        navigate(`/view-video/${submission.video_id}`)
                      }
                    >
                      View Video
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No submissions found for this assignment.</p>
      )}
    </div>
  );
};

export default ViewSubmissions;
