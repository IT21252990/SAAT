import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AssignmentDetails from "../../components/AssignmentDetails.jsx";
import Header from "../../components/Header";


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
    if (
      expandedAssignment &&
      expandedAssignment.assignment_id === assignmentId
    ) {
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
    <div className="min-h-screen h-full flex flex-col items-center  bg-gray-100 dark:bg-gray-900">
        <Header />     
      <div className="mt-10 mb-10 w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Teacher's Module Page
      </h2>

      {/* Add Assignment Button */}
      <button
        onClick={() =>
          navigate(`/add-assignment`, { state: { moduleId, moduleName } })
        }
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Add Assignment
      </button>

      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
        Assignments for {moduleName || "Loading..."}
      </h3>

      {error && <p className="text-red-500">{error}</p>}

      {assignments.length > 0 ? (
        <ul className="space-y-4">
          {assignments.map((assignment) => (
            <li key={assignment.assignment_id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <button
                onClick={() => toggleAssignmentDetails(assignment.assignment_id)}
                className="w-full text-left text-lg font-semibold text-blue-700 dark:text-blue-400 hover:underline"
              >
                {assignment.name}
              </button>

              {/* Expanded assignment details using AssignmentDetails component */}
              {expandedAssignment && expandedAssignment.assignment_id === assignment.assignment_id && (
                <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <AssignmentDetails assignment={expandedAssignment} moduleName={moduleName} />

                  {/* View Student Submissions Button */}
                  <button
                    onClick={() => navigate(`/view-submissions/${assignment.assignment_id}`)}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    View Student Submissions
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No assignments found for this module.</p>
      )}
    </div>
    </div>
  );
};

export default TeacherModulePage;
