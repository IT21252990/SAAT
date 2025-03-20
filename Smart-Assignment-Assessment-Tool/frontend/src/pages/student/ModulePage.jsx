import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Card, Button, Spinner, Alert, Badge } from "flowbite-react";
import { HiArrowLeft, HiX, HiCalendar, HiChevronRight } from "react-icons/hi";

const ModulePage = () => {
  const { moduleId } = useParams();
  const [moduleName, setModuleName] = useState("");
  const [assignments, setAssignments] = useState([]);
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

  // Function to format date (if needed)
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  // Function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
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
          onClick={() => navigate(-1)}
          className="mb-3 transition-all duration-300 group hover:bg-primary-100 dark:hover:bg-gray-700"
        >
          <HiArrowLeft className="mr-2 h-5 w-5 group-hover:translate-x-[-2px] transition-transform duration-300" />
          Back to Dashboard
        </Button>

        <Card className="shadow-xl dark:border-gray-700">
          {/* Card Header with title */}
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
                Browse all assignments in this module
              </p>
            </div>
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
                <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
                  {assignments.map((assignment) => {
                    const deadlineApproaching = isDeadlineApproaching(assignment.deadline);
                    const deadlinePassed = isDeadlinePassed(assignment.deadline);
                    
                    return (
                      <Card 
                        key={assignment.assignment_id} 
                        className="overflow-hidden transition-all duration-300 border-l-4 cursor-pointer hover:shadow-lg hover:scale-105 dark:border-l-4"
                        style={{
                          borderLeftColor: deadlinePassed ? '#DC2626' : deadlineApproaching ? '#F59E0B' : '#2563EB'
                        }}
                        onClick={() =>
                          navigate(`/assignment/${assignment.assignment_id}`, {
                            state: { moduleId, moduleName },
                          })
                        }
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {assignment.name}
                          </h5>
                          <HiChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        
                        <div className="flex items-center mt-4 text-sm">
                          <HiCalendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
                            <span className={`font-medium ${
                              deadlinePassed ? 'text-red-600 dark:text-red-400' : 
                              deadlineApproaching ? 'text-amber-500 dark:text-amber-400' : 
                              'text-gray-900 dark:text-white'
                            }`}>
                              {formatDate(assignment.deadline)}
                            </span>
                          </div>
                          
                          <div className="ml-auto">
                            {deadlinePassed ? (
                              <Badge color="failure" className="ml-2">Overdue</Badge>
                            ) : deadlineApproaching ? (
                              <Badge color="warning" className="ml-2">Soon</Badge>
                            ) : (
                              <Badge color="info" className="ml-2">Active</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <div className="mb-4 text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No assignments yet</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">There are no assignments available for this module.</p>
                </div>
              )}
            </>
          )}
        </Card>
      </main>
    </div>
  );
};

export default ModulePage;