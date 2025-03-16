import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AssignmentDetails from "../../components/AssignmentDetails.jsx";

const TeacherModulePage = () => {
  const { moduleId } = useParams();
  const [moduleName, setModuleName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/module/getModuleName/${moduleId}`
        );
        const data = await response.json();

        if (response.ok) {
          setModuleName(data.name);
        } else {
          setError(data.error || "Module not found!");
        }
      } catch (error) {
        setError("Failed to fetch module: " + error.message);
      }
    };

    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignmentsByModule/${moduleId}`
        );
        const data = await response.json();

        if (response.ok) {
          setAssignments(data.assignments);
        } else {
          setError(data.error || "Something went wrong!");
        }
      } catch (error) {
        setError("Failed to fetch assignments: " + error.message);
      }
    };

    fetchModuleDetails();
    fetchAssignments();
  }, [moduleId]);

  // Function to toggle assignment details
  const toggleAssignmentDetails = async (assignmentId) => {
    if (expandedAssignment && expandedAssignment.assignment_id === assignmentId) {
      setExpandedAssignment(null); // Collapse if already expanded
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`
      );
      const data = await response.json();

      if (response.ok) {
        setExpandedAssignment(data);
      } else {
        setError(data.error || "Failed to fetch assignment details.");
      }
    } catch (error) {
      setError("Error fetching assignment details: " + error.message);
    }
  };

  return (
    <div className="container">
      <h2>Teacher's Module Page</h2>

      {/* Add Assignment Button */}
      <button
        style={{
          marginBottom: "10px",
          padding: "10px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
        onClick={() =>
          navigate(`/add-assignment`, { state: { moduleId, moduleName } })
        }
      >
        Add Assignment
      </button>

      <h2>Assignments for {moduleName || "Loading..."}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {assignments.length > 0 ? (
        <ul>
          {assignments.map((assignment) => (
            <li key={assignment.assignment_id} style={{ marginBottom: "15px" }}>
              <button
                style={{
                  padding: "8px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "5px",
                }}
                onClick={() => toggleAssignmentDetails(assignment.assignment_id)}
              >
                {assignment.name}
              </button>

              {/* Expanded assignment details using AssignmentDetails component */}
              {expandedAssignment &&
                expandedAssignment.assignment_id === assignment.assignment_id && (
                  <div
                    style={{
                      marginTop: "10px",
                      padding: "10px",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    <AssignmentDetails
                      assignment={expandedAssignment}
                      moduleName={moduleName}
                    />

                    {/* View Student Submissions Button */}
                    <button
                      style={{
                        marginTop: "10px",
                        padding: "8px",
                        backgroundColor: "#ffc107",
                        color: "black",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "5px",
                      }}
                      onClick={() =>
                        navigate(`/view-submissions/${assignment.assignment_id}`)
                      }
                    >
                      View Student Submissions
                    </button>
                  </div>
                )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No assignments found for this module.</p>
      )}
    </div>
  );
};

export default TeacherModulePage;
