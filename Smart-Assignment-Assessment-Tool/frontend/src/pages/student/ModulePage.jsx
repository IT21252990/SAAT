import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";


const ModulePage = () => {
  const { moduleId } = useParams();
  const [moduleName, setModuleName] = useState("");
  const [assignments, setAssignments] = useState([]);
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

  return (
    <div className="h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mt-10 rounded-lg bg-gray-50 p-6 shadow-lg dark:bg-gray-700 ">
      <h1 className="mb-4 text-center text-2xl font-semibold text-gray-800 dark:text-white">

      Assignments for {moduleName || "Loading..."}
      </h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <div
            key={assignment.assignment_id}
            onClick={() =>
              navigate(`/assignment/${assignment.assignment_id}`, {
                state: { moduleId, moduleName },
              })
            }
            className="cursor-pointer block max-w-sm p-6 bg-gray-200 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600"
          >
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {assignment.name}
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
              {assignment.description}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Deadline: {assignment.deadline}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-300">
          No assignments found for this module.
        </p>
      )}
    </div>
      </div>
    </div>
  );
};

export default ModulePage;
