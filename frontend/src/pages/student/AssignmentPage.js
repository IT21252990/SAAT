import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import generatePDF from "../../components/PDFGenerator.js";

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
          <p>
            <strong>Assignment Description:</strong> {assignment.description}
          </p>
          <p>
            <strong>Deadline:</strong> {assignment.deadline}
          </p>

          <h3>Assignment Details</h3>
          {assignment.details && assignment.details.length > 0 ? (
            assignment.details.map((detail, index) => (
              <div key={index}>
                <h4>
                  <strong>{detail.topic}</strong>
                </h4>
                <p>{detail.description}</p>
                {detail.subtopics && detail.subtopics.length > 0 && (
                  <div style={{ marginLeft: "20px" }}>
                    {detail.subtopics.map((subtopic, subIndex) => (
                      <div key={subIndex}>
                        <p>
                          <strong>{subtopic.topic}</strong>
                        </p>
                        <p>{subtopic.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No assignment details available.</p>
          )}

          <h3>Marking Criteria</h3>
          <ul>
            {assignment.marking_criteria &&
            Object.keys(assignment.marking_criteria).length > 0 ? (
              Object.entries(assignment.marking_criteria).map(
                ([type, criteria], index) => (
                  <div key={index}>
                    <h4>
                      {type.charAt(0).toUpperCase() + type.slice(1)} Marking
                      Criteria:
                    </h4>
                    {criteria && criteria.length > 0 ? (
                      <ul>
                        {criteria.map((item, subIndex) => (
                          <li key={subIndex}>
                            <strong>{item.criteria}:</strong>{" "}
                            {item.allocated_mark} marks
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No criteria available for this submission type.</p>
                    )}
                  </div>
                )
              )
            ) : (
              <p>No marking criteria available.</p>
            )}
          </ul>

          <h3>Submit Your Work</h3>
          <div>
            {/* Check submission type and display corresponding button */}
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
