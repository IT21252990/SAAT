import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId, moduleName } = location.state || {}; // Retrieve passed state
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve studentId from localStorage
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/assignment/getAssignment/${assignmentId}`
        );
        const data = await response.json();

        if (response.ok) {
          setAssignment(data);
        } else {
          setError(data.error || "Assignment not found!");
        }
      } catch (error) {
        setError("Failed to fetch assignment: " + error.message);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleSubmission = async (submissionType) => {
    if (!studentId) {
      setError("User not logged in. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/submission/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignment_id: assignmentId,
          submission_type: submissionType,
          student_id: studentId, // Use studentId from localStorage
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        navigate(`/submit/${submissionType.toLowerCase()}`, {
          state: {
            submissionId: data.submission.submission_id,
            assignmentId,
            moduleId,
            moduleName,
          },
        });
      } else {
        setError(data.error || "Failed to create submission!");
      }
    } catch (error) {
      setError("Failed to create submission: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : assignment ? (
        <>
          <h2>{assignment.name}</h2>
          <p>
            <strong>Module:</strong> {moduleName || "Unknown Module"}
          </p>
          <h3>Marking Criteria</h3>
          <ul>
            {assignment.marking && assignment.marking.length > 0 ? (
              assignment.marking.map((criteria, index) => (
                <li key={index}>
                  <strong>{criteria.criteria}:</strong> {criteria.allocated_mark} marks
                </li>
              ))
            ) : (
              <p>No marking criteria available.</p>
            )}
          </ul>

          <h3>Submit Your Work</h3>
          <button onClick={() => handleSubmission("Code")} disabled={loading}>
            {loading ? "Processing..." : "Submit Code"}
          </button>
          <button onClick={() => handleSubmission("Report")} disabled={loading}>
            {loading ? "Processing..." : "Submit Report"}
          </button>
          <button onClick={() => handleSubmission("Video")} disabled={loading}>
            {loading ? "Processing..." : "Submit Video"}
          </button>
        </>
      ) : (
        <p>Loading assignment details...</p>
      )}
    </div>
  );
};

export default AssignmentPage;
