import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AssignmentDetails from "../../components/AssignmentDetails.jsx";
import generatePDF from "../../components/PDFGenerator.jsx";
import Header from "../../components/Header.jsx";
import thumbsUp from "../../asserts/Thumbs-up.gif";
import { Card, Button, Spinner, Alert, Badge } from "flowbite-react";
import { HiArrowLeft, HiX, HiDocumentDownload, HiUpload, HiCalendar, HiClock } from "react-icons/hi";

const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId, moduleName } = location.state || {};
  const [assignment, setAssignment] = useState(null);
  const [marking, setMarking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);

  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`
        );

        const responseMarking = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/marking-scheme/markingScheme/${assignmentId}`
        );

        const data = await response.json();
        const dataMarking = await responseMarking.json();

        if (response.ok) {
          setAssignment(data);
        } else {
          setError(data.error || "Assignment not found!");
        }

        if (responseMarking.ok) {
          setMarking(dataMarking.marking_schemes[0]);
        } else {
          setError(dataMarking.error || "Marking not found!");
        }
      } catch (error) {
        setError("Failed to fetch assignment: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissionStatus = async () => {
      if (!studentId || !assignmentId) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/check-submission`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignment_id: assignmentId, student_id: studentId }),
        });

        const data = await response.json();
        if (response.ok && data.exists) {
          setHasSubmitted(true);
          setSubmissionId(data.submission_id); // Save submission ID for results view
        }
      } catch (error) {
        console.error("Error checking submission:", error);
      }
    };

    fetchAssignmentDetails();
    fetchSubmissionStatus();
  }, [assignmentId, studentId]);

  const handleSubmitClick = () => {
    if (!studentId) {
      setError("User not logged in. Please log in again.");
      return;
    }

    setSubmitting(true);
    navigate(`/add-submission/${assignmentId}`, {
      state: {
        assignmentId,
        moduleId,
        moduleName,
      },
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date available";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  const getTimeRemaining = (deadline) => {
    if (!deadline) return "No deadline set";

    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (deadlineDate < now) {
      return "Deadline passed";
    }

    const diffTime = deadlineDate - now;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} and ${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    } else {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
    }
  };

  const dismissError = () => {
    setError("");
  };

  const getDeadlineStatus = () => {
    if (hasSubmitted) return "success";
    if (!assignment || !assignment.deadline) return "info";
    if (isDeadlinePassed(assignment.deadline)) return "failure";
    if (isDeadlineApproaching(assignment.deadline)) return "warning";
    return "info";
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
          Back to {moduleName || "Module"}
        </Button>

        {error && (
          <Alert color="failure" className="mb-4" onDismiss={dismissError}>
            <div className="flex items-center">
              <HiX className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="xl" />
            <span className="ml-4 text-xl font-medium text-gray-700 dark:text-gray-300">Loading assignment details...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="w-full lg:w-2/3">
              <Card className="h-full shadow-xl dark:border-gray-700">
                {assignment && (
                  <>
                    <div className="pb-4 border-b dark:border-gray-700">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {assignment.name}
                        </h1>

                        <Badge
                          color={getDeadlineStatus()}
                          className="text-sm px-3 py-1.5 font-medium"
                        >
                          {hasSubmitted ? "Submitted" :
                            isDeadlinePassed(assignment.deadline) ? "Overdue" :
                              isDeadlineApproaching(assignment.deadline) ? "Due Soon" :
                                "Active"}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-6 mt-3">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <HiCalendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Deadline:</span>
                            <p className={`font-medium ${isDeadlinePassed(assignment.deadline) ? 'text-red-600 dark:text-red-400' :
                                isDeadlineApproaching(assignment.deadline) ? 'text-amber-500 dark:text-amber-400' :
                                  'text-gray-900 dark:text-white'
                              }`}>
                              {formatDate(assignment.deadline)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <HiClock className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Time remaining:</span>
                            <p className={`font-medium ${isDeadlinePassed(assignment.deadline) ? 'text-red-600 dark:text-red-400' :
                                isDeadlineApproaching(assignment.deadline) ? 'text-amber-500 dark:text-amber-400' :
                                  'text-gray-900 dark:text-white'
                              }`}>
                              {getTimeRemaining(assignment.deadline)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="py-2">
                      <AssignmentDetails
                        assignment={assignment}
                        moduleName={moduleName}
                        marking={marking}
                      />
                    </div>
                  </>
                )}
              </Card>
            </div>

            <div className="w-full lg:w-1/3">
              <Card className="sticky shadow-xl dark:border-gray-700 top-24">
                <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
                  Assignment Submission
                </h3>

                <div className="flex justify-center mb-5">
                  <img src={thumbsUp} alt="Thumbs Up" className="rounded-full shadow-lg w-28" />
                </div>

                <Button
                  color="blue"
                  onClick={handleSubmitClick}
                  disabled={submitting}
                  className="w-full py-3 font-medium text-center transition-transform duration-300 hover:scale-105"
                >
                  <HiUpload className="w-5 h-5 mr-2" />
                  {submitting ? "Processing..." : "Upload Submission"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-400">
                      OR
                    </span>
                  </div>
                </div>

                <Button
                  color="success"
                  onClick={() => generatePDF(assignment, moduleName, marking)}
                  className="w-full py-3 font-medium text-center transition-transform duration-300 hover:scale-105"
                >
                  <HiDocumentDownload className="w-5 h-5 mr-2" />
                  Download Assignment PDF
                </Button>

                {hasSubmitted && submissionId && (
                  <Button
                    color="info"
                    onClick={() => navigate(`/submission-results/${submissionId}`)}
                    className="w-full mt-4 py-3 font-medium text-center transition-transform duration-300 hover:scale-105"
                  >
                    📊 See Results
                  </Button>
                )}


                {hasSubmitted && (
                  <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900 dark:bg-opacity-30 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      ✅ You have already submitted this assignment.
                    </p>
                  </div>
                )}

                {!hasSubmitted && isDeadlineApproaching(assignment?.deadline) && (
                  <div className="p-3 mt-4 border rounded-lg bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30 border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      ⚠️ Deadline approaching! Make sure to submit your work soon.
                    </p>
                  </div>
                )}

                {!hasSubmitted && isDeadlinePassed(assignment?.deadline) && (
                  <div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900 dark:bg-opacity-30 dark:border-red-800">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">
                      ⚠️ Deadline has passed. Late submissions may be penalized.
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssignmentPage;
