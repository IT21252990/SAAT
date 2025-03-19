import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AssignmentDetails from "../../components/AssignmentDetails.jsx";
import Header from "../../components/Header";
import { Card, Button, Spinner, Alert, Tooltip } from "flowbite-react";
import { HiArrowLeft, HiPlus, HiPencil, HiDocumentText, HiChevronDown, HiChevronUp, HiX } from "react-icons/hi";

const TeacherModulePage = () => {
  const { moduleId } = useParams();
  const [moduleName, setModuleName] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch module details
        const moduleResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/module/getModuleName/${moduleId}`
        );
        const moduleData = await moduleResponse.json();

        if (moduleResponse.ok) {
          setModuleName(moduleData.name);
        } else {
          setError(moduleData.error || "Module not found!");
          setLoading(false);
          return;
        }

        // Fetch assignments
        const assignmentsResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignmentsByModule/${moduleId}`
        );
        const assignmentsData = await assignmentsResponse.json();

        if (assignmentsResponse.ok) {
          setAssignments(assignmentsData.assignments);
        } else {
          setError(assignmentsData.error || "Failed to load assignments!");
        }
      } catch (error) {
        setError("Connection error: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Function to dismiss error
  const dismissError = () => {
    setError("");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>
            <main className="container px-4 pt-20 pb-5 mx-auto">
        <Button 
          color="light" 
          onClick={() => navigate("/teacher-home")}
          className="mb-3 transition-all duration-300 group hover:bg-primary-100 dark:hover:bg-gray-700"
        >
          <HiArrowLeft className="mr-2 h-5 w-5 group-hover:translate-x-[-2px] transition-transform duration-300" />
          Back to Dashboard
        </Button>

        <Card className="shadow-xl dark:border-gray-700">
          {/* Card Header with title and add button */}
          <div className="flex flex-col items-start justify-between gap-4 pb-4 border-b sm:flex-row sm:items-center dark:border-gray-700">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" className="mr-2" />
                    Loading module...
                  </div>
                ) : (
                  <>Module: {moduleName}</>
                )}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Browse and manage all assignments in this module
              </p>
            </div>
            
            <Button
              color="blue"
              onClick={() =>
                navigate(`/add-assignment`, { state: { moduleId, moduleName } })
              }
              className="transition-transform duration-300 hover:scale-105"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Add New Assignment
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <Alert color="failure" className="mt-4" onDismiss={dismissError}>
              <div className="flex items-center">
                <HiX className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </Alert>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner size="xl" />
            </div>
          ) : (
            <>
              {/* Assignment list */}
              {assignments.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {assignments.map((assignment, index) => (
                    <Card key={assignment.assignment_id} className="overflow-hidden">
                      <div className="flex flex-col justify-between gap-4 lg:flex-row">
                        {/* Assignment title and toggle button */}
                        <button
                          onClick={() => toggleAssignmentDetails(assignment.assignment_id)}
                          className="flex items-center text-lg font-medium text-left transition-colors text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200"
                        >
                          <span className="inline-flex items-center justify-center w-8 h-8 mr-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
                            {index + 1}
                          </span>
                          <span className="flex-grow">{assignment.name}</span>
                          {expandedAssignment && expandedAssignment.assignment_id === assignment.assignment_id ? (
                            <HiChevronUp className="w-5 h-5 ml-2" />
                          ) : (
                            <HiChevronDown className="w-5 h-5 ml-2" />
                          )}
                        </button>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Tooltip content="Edit this assignment">
                            <Button
                              color="warning"
                              size="sm"
                              onClick={() => navigate(`/edit-assignment/${assignment.assignment_id}`)}
                              className="transition-transform duration-300 hover:scale-105"
                            >
                              <HiPencil className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Tooltip>
                          
                          <Tooltip content="View all student submissions">
                            <Button
                              color="success"
                              size="sm"
                              onClick={() => navigate(`/view-submissions/${assignment.assignment_id}`)}
                              className="transition-transform duration-300 hover:scale-105"
                            >
                              <HiDocumentText className="w-4 h-4 mr-2" />
                              Submissions
                            </Button>
                          </Tooltip>
                        </div>
                      </div>

                      {/* Expanded assignment details with animation */}
                      {expandedAssignment && expandedAssignment.assignment_id === assignment.assignment_id && (
                        <div className="pt-4 mt-4 border-t dark:border-gray-700">
                          <AssignmentDetails assignment={expandedAssignment} moduleName={moduleName} />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mb-4 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No assignments yet</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">Get started by creating a new assignment.</p>
                  <div className="mt-6">
                    <Button
                      color="blue"
                      onClick={() =>
                        navigate(`/add-assignment`, { state: { moduleId, moduleName } })
                      }
                    >
                      <HiPlus className="w-5 h-5 mr-2" />
                      Create First Assignment
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </main>
    </div>
  );
};

export default TeacherModulePage;