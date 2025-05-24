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
  const { moduleId, moduleName } = location.state || {}; // Retrieve passed state
  const [assignment, setAssignment] = useState(null);
  const [marking, setMarking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState([]);

  // Retrieve studentId from localStorage
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`,
        );

        const responseMarking = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/marking-scheme/markingScheme/${assignmentId}`,
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
          console.log(dataMarking)
        } else {
          setError(dataMarking.error || "Marking not found!");
        }
      } catch (error) {
        setError("Failed to fetch assignment: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

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

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date available";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  // Function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  // Function to get time remaining until deadline
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

  // Function to dismiss error
  const dismissError = () => {
    setError("");
  };

  // Get deadline status for styling
  const getDeadlineStatus = () => {
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

        {/* Error message */}
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
            {/* Assignment Details Section */}
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
                          {isDeadlinePassed(assignment.deadline) ? "Overdue" : 
                           isDeadlineApproaching(assignment.deadline) ? "Due Soon" : "Active"}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-6 mt-3">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <HiCalendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Deadline:</span>
                            <p className={`font-medium ${
                              isDeadlinePassed(assignment.deadline) ? 'text-red-600 dark:text-red-400' : 
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
                            <p className={`font-medium ${
                              isDeadlinePassed(assignment.deadline) ? 'text-red-600 dark:text-red-400' : 
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
            
            {/* Submission Section */}
            <div className="w-full lg:w-1/3">
              <Card className="sticky shadow-xl dark:border-gray-700 top-24">
                <h3 className="mb-4 text-xl font-bold text-center text-gray-900 dark:text-white">
                  Assignment Submission
                </h3>
                
                {/* Thumbs-up GIF */}
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
                
                {isDeadlineApproaching(assignment?.deadline) && !isDeadlinePassed(assignment?.deadline) && (
                  <div className="p-3 mt-4 border rounded-lg bg-amber-50 dark:bg-amber-900 dark:bg-opacity-30 border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      ⚠️ Deadline approaching! Make sure to submit your work soon.
                    </p>
                  </div>
                )}
                
                {isDeadlinePassed(assignment?.deadline) && (
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
    // <>
    //   <sHeader />
    //   {/* Main container with flex-row for side-by-side layout */}
    //   <div className="flex flex-row w-full gap-6 p-6 mt-4 max-w-7xl">
    //     {/* Assignment Box */}
    //     <div className="flex-1 p-6 border border-gray-200 rounded-lg shadow-md dark:border-gray-700 dark:bg-gray-800">
    //       <div className="flex-1">
    //         {error ? (
    //           <p className="text-red-500">{error}</p>
    //         ) : assignment ? (
    //           <>
    //             <AssignmentDetails assignment={assignment} moduleName={moduleName} />

    //             {/* Marking Scheme Table */}
    //             {marking && marking.marking_schemes.length > 0 && (
    //               <div className="mt-6">
    //                 <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
    //                   Marking Scheme for report submission
    //                 </h3>
    //                 <div className="overflow-x-auto">
    //                   <table className="w-full border border-collapse border-gray-300 dark:border-gray-700">
    //                     <thead className="bg-gray-200 dark:bg-gray-700">
    //                       <tr>
    //                         <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                           Criterion
    //                         </th>
    //                         <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                           Low Description
    //                         </th>
    //                         <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                           High Description
    //                         </th>
    //                         <th className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                           Weightage
    //                         </th>
    //                       </tr>
    //                     </thead>
    //                     <tbody>
    //                       {marking.marking_schemes[0].criteria.map((criterion, index) => (
    //                         <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
    //                           <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                             {criterion.criterion}
    //                           </td>
    //                           <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                             {criterion.low_description}
    //                           </td>
    //                           <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                             {criterion.high_description}
    //                           </td>
    //                           <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
    //                             {criterion.weightage}
    //                           </td>
    //                         </tr>
    //                       ))}
    //                     </tbody>
    //                   </table>
    //                 </div>
    //               </div>
    //             )}
    //           </>
    //         ) : (
    //           <p>Loading assignment details...</p>
    //         )}
    //       </div>
    //     </div>


    //     {/* Submission Box */}
    //     <div className="sticky p-10 bg-white border border-gray-200 rounded-lg shadow-md top-6 h-fit w-80 dark:border-gray-600 dark:bg-gray-700">
    //       <h3 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
    //         Submit Your Work Here !{" "}
    //       </h3>
    //       {/* Thumbs-up GIF */}
    //       <div className="mb-5">
    //         <img src={thumbsUp} alt="Thumbs Up" className="mx-auto w-28" />
    //       </div>
    //       <button
    //         onClick={handleSubmitClick}
    //         disabled={loading}
    //         className="w-full px-4 py-2 text-lg text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
    //       >
    //         {loading ? "Processing..." : "Upload Submission"}
    //       </button>

    //         <hr className="w-full h-px my-10 bg-gray-200 border-0 dark:bg-gray-200 dark:bg-opacity-80" />

    //         <button
    //           onClick={() => generatePDF(assignment, moduleName)}
    //           className="w-full px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
    //         >
    //           Download Assignment <br />
    //           as a PDF 📩
    //         </button>
    //       </div>
    //     </div>
    // </>
  );
};

export default AssignmentPage;