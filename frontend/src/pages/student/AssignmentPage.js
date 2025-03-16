import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import generatePDF from "../../components/PDFGenerator.js";
import AssignmentDetails from "../../components/AssignmentDetails.js";

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
        
        {/* Display assignment details */}
          <AssignmentDetails assignment={assignment} moduleName={moduleName} />

          <h3>Submit Your Work</h3>
          <div>
            {assignment.submission_types.code && (
              <button
                onClick={() => handleSubmission("Code")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit Code"}
              </button>
            )}
            {assignment.submission_types.report && (
              <button
                onClick={() => handleSubmission("Report")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit Report"}
              </button>
            )}
            {assignment.submission_types.video && (
              <button
                onClick={() => handleSubmission("Video")}
                disabled={loading}
              >
                {loading ? "Processing..." : "Submit Video"}
              </button>
            )}
          </div>

          {/* Button to generate PDF */}
          <button
            onClick={() => generatePDF(assignment, moduleName)}
            className="generate-pdf-btn"
          >
            Generate PDF
          </button>
        </>
      ) : (
        <p>Loading assignment details...</p>
      )}
    </div>
  );
};

export default AssignmentPage;
