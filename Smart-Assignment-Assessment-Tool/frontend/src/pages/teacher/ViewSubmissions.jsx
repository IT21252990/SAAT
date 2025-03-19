// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import Header from "../../components/Header";

// const ViewSubmissions = () => {
//   const { assignmentId } = useParams();
//   const [submissions, setSubmissions] = useState([]);
//   const [github_url, setGithub_url] = useState("");
//   const [codeId, setCodeId] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const fetchUserEmail = async (uid) => {
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${uid}`,
//       );
//       const data = await response.json();
//       if (response.ok) {
//         return data.email;
//       } else {
//         throw new Error(data.error || "Failed to fetch user.");
//       }
//     } catch (error) {
//       setError("Error fetching user data: " + error.message);
//       return null;
//     }
//   };

//   const getRepoUrl = async (codeId, submissionId) => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/repo/get-github-url`,
//         {
//           params: { code_id: codeId },
//         },
//       );

//       if (response.status === 200) {
//         const githubUrl = response.data.github_url;
//         setGithub_url(githubUrl);
//         await handleFetchRepo(githubUrl, codeId, submissionId);
//       } else {
//         setError("GitHub URL not found for this submission.");
//       }
//     } catch (error) {
//       console.error("Error fetching GitHub URL:", error);
//       setError("Failed to fetch the GitHub URL.");
//     }
//   };

//   const handleFetchRepo = async (githubUrl, codeId, submissionId) => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/repo/repo-details`,
//         { params: { repo_url: githubUrl } },
//       );

//       if (response.status === 200) {
//         navigate(`/view-code/${codeId}`, {
//           state: { githubUrl, repoDetails: response.data, submissionId, codeId },
//         });
//       } else {
//         alert("Failed to fetch repository details.");
//       }
//     } catch (error) {
//       console.error("Error fetching repository:", error);
//       alert("Failed to fetch the repository. Please check the URL.");
//     }
//   };

//   useEffect(() => {
//     const fetchSubmissions = async () => {
//       try {
//         const response = await fetch(
//           `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionsByAssignment/${assignmentId}`,
//         );
//         const data = await response.json();

//         if (response.ok) {
//           const submissionsWithEmails = await Promise.all(
//             data.submissions.map(async (submission) => {
//               const email = await fetchUserEmail(submission.student_id);
//               setCodeId(submission.code_id);
//               return { ...submission, email };
//             }),
//           );
//           setSubmissions(submissionsWithEmails);
//         } else {
//           setError(data.error || "Failed to fetch submissions.");
//         }
//       } catch (error) {
//         setError("Error fetching submissions: " + error.message);
//       }
//     };

//     fetchSubmissions();
//   }, [assignmentId]);

//   return (
//     <div className="flex flex-col items-center h-full min-h-screen bg-gray-100 dark:bg-gray-900">
//       <Header />
//       <div className="w-full max-w-6xl p-6 mt-10 mb-10 bg-white rounded-lg shadow-lg dark:bg-gray-800">
//         <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
//           Student Submissions
//         </h2>

//         {error && <p className="text-red-500">{error}</p>}

//         {submissions.length > 0 ? (
//           <div className="relative overflow-x-auto border border-gray-300 shadow-md dark:border-gray-600 sm:rounded-lg">
//             <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rtl:text-right">
//               <thead className="text-gray-700 uppercase text-s bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
//                 <tr>
//                   <th scope="col" className="px-6 py-3">
//                     #
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Student Email
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Submitted Time
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Actions
//                   </th>
//                   <th scope="col" className="px-6 py-3">
//                     Viva Dashboard
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {submissions.map((submission, index) => (
//                   <tr
//                     key={submission.submission_id}
//                     className="bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800"
//                   >
//                     <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                       {index + 1}
//                     </td>
//                     <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300">
//                       {submission.email}
//                     </td>
//                     <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300">
//                       {new Date(submission.created_at).toLocaleString()}
//                     </td>
//                     <td className="px-6 py-4">
//                       {/* View Code */}
//                       {submission.code_id && (
//                         <button
//                           className="px-3 py-1 mr-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                           onClick={() =>
//                             getRepoUrl(
//                               submission.code_id,
//                               submission.submission_id,
//                             )
//                           }
//                         >
//                           View Code
//                         </button>
//                       )}

//                       {/* View Report */}
//                       {submission.report_id && (
//                         <button
//                           className="px-3 py-1 mr-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
//                           onClick={() =>
//                             navigate(`/view-report/${submission.report_id}`)
//                           }
//                         >
//                           View Report
//                         </button>
//                       )}

//                       {/* View Video */}
//                       {submission.video_id && (
//                         <button
//                           className="px-3 py-1 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
//                           onClick={() =>
//                             navigate(`/videoSubmission/video-screen`, {
//                               state: {
//                                 videoId: submission.video_id,
//                                 submissionId: submission.submission_id,
//                               },
//                             })
//                           }
//                         >
//                           View Video
//                         </button>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <button
//                         className="px-3 py-1 text-white bg-purple-600 rounded-md hover:bg-purple-700"
//                         onClick={() =>
//                           navigate(
//                             `/viva-dashboard/${submission.submission_id}`,
//                           )
//                         }
//                       >
//                         Go
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-600 dark:text-gray-300">
//             No submissions found for this assignment.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewSubmissions;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import { Card, Spinner, Button, Alert, Badge } from "flowbite-react";
import { HiArrowLeft, HiOutlineCode, HiDocumentText, HiVideoCamera, HiChevronRight, HiExclamation } from "react-icons/hi";

const ViewSubmissions = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assignmentName, setAssignmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUserEmail = async (uid) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${uid}`,
      );
      const data = await response.json();
      if (response.ok) {
        return data.email;
      } else {
        throw new Error(data.error || "Failed to fetch user.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const getRepoUrl = async (codeId, submissionId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/get-github-url`,
        {
          params: { code_id: codeId },
        },
      );

      if (response.status === 200) {
        const githubUrl = response.data.github_url;
        await handleFetchRepo(githubUrl, codeId, submissionId);
      } else {
        setError("GitHub URL not found for this submission.");
      }
    } catch (error) {
      console.error("Error fetching GitHub URL:", error);
      setError("Failed to fetch the GitHub URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRepo = async (githubUrl, codeId, submissionId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/repo-details`,
        { params: { repo_url: githubUrl } },
      );

      if (response.status === 200) {
        navigate(`/view-code/${codeId}`, {
          state: { githubUrl, repoDetails: response.data, submissionId, codeId },
        });
      } else {
        setError("Failed to fetch repository details.");
      }
    } catch (error) {
      console.error("Error fetching repository:", error);
      setError("Failed to fetch the repository. Please check the URL.");
    }
  };

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`,
      );
      const data = await response.json();
      if (response.ok) {
        setAssignmentName(data.name);
      }
    } catch (error) {
      console.error("Error fetching assignment details:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch assignment details
        await fetchAssignmentDetails();
        
        // Fetch submissions
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionsByAssignment/${assignmentId}`,
        );
        const data = await response.json();

        if (response.ok) {
          const submissionsWithEmails = await Promise.all(
            data.submissions.map(async (submission) => {
              const email = await fetchUserEmail(submission.student_id);
              return { 
                ...submission, 
                email,
                formattedDate: new Date(submission.created_at).toLocaleString('en-US', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              };
            }),
          );
          setSubmissions(submissionsWithEmails);
        } else {
          setError(data.error || "Failed to fetch submissions.");
        }
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  // Function to go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>
            <div className="container px-4 pt-24 pb-8 mx-auto">
        <div className="flex items-center mb-6">
          <Button color="light" onClick={handleGoBack} className="mr-4">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Module
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {assignmentName ? `Submissions for "${assignmentName}"` : "Student Submissions"}
          </h1>
        </div>

        {error && (
          <Alert color="failure" className="mb-6">
            <div className="flex items-center">
              <HiExclamation className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Spinner size="xl" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading submissions...</p>
            </div>
          </div>
        ) : submissions.length > 0 ? (
          <Card className="overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium">
                      Actions
                    </th>
                    <th scope="col" className="px-6 py-4 font-medium text-right">
                      Viva
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {submissions.map((submission) => (
                    <tr 
                      key={submission.submission_id} 
                      className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {submission.email || "Unknown Student"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{submission.formattedDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {submission.code_id && (
                            <Button 
                              size="xs"
                              color="blue"
                              onClick={() => getRepoUrl(submission.code_id, submission.submission_id)}
                              className="flex items-center"
                            >
                              <HiOutlineCode className="mr-1" />
                              View Code
                            </Button>
                          )}
                          {submission.report_id && (
                            <Button
                              size="xs"
                              color="green"
                              onClick={() => navigate(`/view-report/${submission.report_id}`)}
                              className="flex items-center"
                            >
                              <HiDocumentText className="mr-1" />
                              View Report
                            </Button>
                          )}
                          {submission.video_id && (
                            <Button
                              size="xs"
                              color="yellow"
                              onClick={() =>
                                navigate(`/videoSubmission/video-screen`, {
                                  state: {
                                    videoId: submission.video_id,
                                    submissionId: submission.submission_id,
                                  },
                                })
                              }
                              className="flex items-center"
                            >
                              <HiVideoCamera className="mr-1" />
                              View Video
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="xs"
                          color="purple"
                          onClick={() => navigate(`/viva-dashboard/${submission.submission_id}`)}
                          className="flex items-center"
                          pill
                        >
                          Viva Dashboard
                          <HiChevronRight className="ml-1" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="flex items-center justify-center h-48">
            <p className="text-center text-gray-600 dark:text-gray-400">
              No submissions found for this assignment.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewSubmissions;