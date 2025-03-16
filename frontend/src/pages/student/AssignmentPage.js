import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AssignmentDetails from "../../components/AssignmentDetails.js";
import generatePDF from "../../components/PDFGenerator.js"

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

  const handleSubmitClick = () => {
    if (!studentId) {
      setError("User not logged in. Please log in again.");
      return;
    }

    navigate(`/add-submission/${assignmentId}`, {
      state: {
        assignmentId,
        moduleId,
        moduleName,
      },
    });
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
            <button
              onClick={handleSubmitClick}
              disabled={loading}
            >
              {loading ? "Processing..." : "Submit"}
            </button>
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
