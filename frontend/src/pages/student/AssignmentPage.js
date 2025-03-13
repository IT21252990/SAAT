import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";

const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const { moduleId, moduleName } = location.state || {}; // Retrieve passed state
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");

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

  return (
    <div className="container">
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : assignment ? (
        <>
          <h2>{assignment.name}</h2>
          <p><strong>Module:</strong> {moduleName || "Unknown Module"}</p>
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
          <button onClick={() => alert("Upload Code")}>Submit Code</button>
          <button onClick={() => alert("Upload Report")}>Submit Report</button>
          <button onClick={() => alert("Upload Video")}>Submit Video</button>
        </>
      ) : (
        <p>Loading assignment details...</p>
      )}
    </div>
  );
};

export default AssignmentPage;
