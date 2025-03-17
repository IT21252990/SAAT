import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";

const ViewSubmissions = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [github_url, setGithub_url] = useState("");
  const [codeId, setCodeId] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUserEmail = async (uid) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${uid}`
      );
      const data = await response.json();
      if (response.ok) {
        return data.email;
      } else {
        throw new Error(data.error || "Failed to fetch user.");
      }
    } catch (error) {
      setError("Error fetching user data: " + error.message);
      return null;
    }
  };

  const getRepoUrl = async (codeId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/get-github-url`,
        {
          params: { code_id: codeId },
        }
      );

      if (response.status === 200) {
        const githubUrl = response.data.github_url;
        setGithub_url(githubUrl);
        await handleFetchRepo(githubUrl, codeId);
      } else {
        setError("GitHub URL not found for this submission.");
      }
    } catch (error) {
      console.error("Error fetching GitHub URL:", error);
      setError("Failed to fetch the GitHub URL.");
    }
  };

  const handleFetchRepo = async (githubUrl, codeId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/repo-details`,
        { params: { repo_url: githubUrl } }
      );

      if (response.status === 200) {
        navigate(`/view-code/${codeId}`, {
          state: { githubUrl, repoDetails: response.data },
        });
      } else {
        alert("Failed to fetch repository details.");
      }
    } catch (error) {
      console.error("Error fetching repository:", error);
      alert("Failed to fetch the repository. Please check the URL.");
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionsByAssignment/${assignmentId}`
        );
        const data = await response.json();

        if (response.ok) {
          const submissionsWithEmails = await Promise.all(
            data.submissions.map(async (submission) => {
              const email = await fetchUserEmail(submission.student_id);
              setCodeId(submission.code_id);
              return { ...submission, email };
            })
          );
          setSubmissions(submissionsWithEmails);
        } else {
          setError(data.error || "Failed to fetch submissions.");
        }
      } catch (error) {
        setError("Error fetching submissions: " + error.message);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  return (
    <div className="min-h-screen h-full flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mt-10 mb-10 w-full max-w-6xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Student Submissions
        </h2>
  
        {error && <p className="text-red-500">{error}</p>}
  
        {submissions.length > 0 ? (
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-gray-300 dark:border-gray-600">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-s text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    # 
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Student Email
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Submitted Time
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Viva Dashboard
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission, index) => (
                  <tr
                    key={submission.submission_id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300">{submission.email}</td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-300">
                      {new Date(submission.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {/* View Code */}
                      {submission.code_id && (
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
                          onClick={() => getRepoUrl(submission.code_id)}
                        >
                          View Code
                        </button>
                      )}
  
                      {/* View Report */}
                      {submission.report_id && (
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
                          onClick={() =>
                            navigate(`/view-report/${submission.report_id}`)
                          }
                        >
                          View Report
                        </button>
                      )}
  
                      {/* View Video */}
                      {submission.video_id && (
                        <button
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                          onClick={() =>
                            navigate(`/view-video/${submission.video_id}`)
                          }
                        >
                          View Video
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        onClick={() => navigate(`/viva-dashboard/${submission.submission_id}`)}
                      >
                        Go
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">
            No submissions found for this assignment.
          </p>
        )}
      </div>
    </div>
  );
  
};

export default ViewSubmissions;
