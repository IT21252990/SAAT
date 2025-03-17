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
    <div className="min-h-screen h-full flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mt-10 mb-10 w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        
        {/* Container for heading and button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Assignments available for {moduleName || "Loading..."}
          </h2>
  
          {/* Add Assignment Button */}
          <button
            onClick={() =>
              navigate(`/add-assignment`, { state: { moduleId, moduleName } })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add New Assignment 
          </button>
        </div>
  
        {error && <p className="text-red-500">{error}</p>}
  
        {assignments.length > 0 ? (
          <ul className="space-y-4">
            {assignments.map((assignment, index) => (
              <li key={assignment.assignment_id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md">
                
                {/* Assignment Name & Action Buttons */}
                <div className="flex justify-between items-center">
                  
                  {/* Numbered Assignment Name */}
                  <button
                    onClick={() => toggleAssignmentDetails(assignment.assignment_id)}
                    className="text-lg font-semibold text-blue-700 dark:text-blue-100 hover:underline"
                  >
                    {index + 1}. {assignment.name} 🔽
                  </button>
  
                  {/* Buttons for Edit & View Submissions */}
                  <div className="flex space-x-2">
                    {/* Edit Assignment Button */}
                    <button
                      onClick={() => navigate(`/edit-assignment/${assignment.assignment_id}`)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Edit Assignment ✏️
                    </button>
  
                    {/* View Student Submissions Button */}
                    <button
                      onClick={() => navigate(`/view-submissions/${assignment.assignment_id}`)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      View Student Submissions 📄
                    </button>
                  </div>
                </div>
  
                {/* Expanded assignment details */}
                {expandedAssignment && expandedAssignment.assignment_id === assignment.assignment_id && (
                  <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg">
                    <AssignmentDetails assignment={expandedAssignment} moduleName={moduleName} />
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
