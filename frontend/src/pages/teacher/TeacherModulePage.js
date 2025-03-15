import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TeacherModulePage = () => {
  const { moduleId } = useParams();
  const [moduleName, setModuleName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/module/getModuleName/${moduleId}`
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
          `http://127.0.0.1:5000/assignment/getAssignmentsByModule/${moduleId}`
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
        onClick={() => navigate(`/add-assignment`, { state: { moduleId, moduleName } })}
      >
        Add Assignment
      </button>

      <h2>Assignments for {moduleName || "Loading..."}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {assignments.length > 0 ? (
        <ul>
          {assignments.map((assignment) => (
            <li key={assignment.assignment_id}>
              <button
                onClick={() =>
                  navigate(`/assignment/${assignment.assignment_id}`, {
                    state: { moduleId, moduleName }, // Pass module data
                  })
                }
              >
                {assignment.name}
              </button>
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
