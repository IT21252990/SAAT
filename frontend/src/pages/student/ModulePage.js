import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ModulePage = () => {
  const { moduleId } = useParams();
  const [moduleName, setModuleName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/module/getModuleName/${moduleId}`
        );
        const data = await response.json();

        if (response.ok) {
          setModuleName(data.name); // Store module name
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
      <h2>Assignments for {moduleName || "Loading..."}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {assignments.length > 0 ? (
        <ul>
          {assignments.map((assignment) => (
            <li key={assignment.assignment_id}>{assignment.name}</li>
          ))}
        </ul>
      ) : (
        <p>No assignments found for this module.</p>
      )}
    </div>
  );
};

export default ModulePage;
