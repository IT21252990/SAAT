import React, { useState, useEffect } from "react";
import { Card, Alert, Spinner } from "flowbite-react";

const DisplayAssignmentDetails = ({ submission_id }) => {
  const [submissionData, setSubmissionData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSubmissionDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionData/${submission_id}`
      );

      if (response.ok) {
        const data = await response.json();
        setSubmissionData(data.submission_data);
      } else {
        setError("Failed to fetch submission details.");
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
      setError("Error fetching submission details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionDetails();
  }, [submission_id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mb-10 mt-10 w-full max-w-5xl mx-auto rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
      <h2 className="text-2xl font-bold text-black dark:text-primary-300 mb-6 flex items-center">
        <span className="bg-primary-100 dark:bg-primary-900 p-2 rounded-lg mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600 dark:text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        Submission Details
      </h2>

      {error && (
        <Alert color="failure" className="mb-6 border-l-4 border-red-500">
          <span className="font-medium">{error}</span>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Spinner size="xl" />
          <span className="ml-3 text-primary-600 dark:text-primary-400">Loading submission details...</span>
        </div>
      ) : submissionData ? (
        <Card className="bg-gradient-to-br from-gray-50 to-primary-50 dark:from-gray-700 dark:to-primary-900 text-gray-700 dark:text-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="group">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Submission ID</h3>
                <p className="font-medium text-lg text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md">{submissionData.submission_id}</p>
              </div>
              
              <div className="group">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Module Name</h3>
                <p className="font-medium text-lg text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md">{submissionData.module_name}</p>
              </div>
              
              <div className="group">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Assignment Name</h3>
                <p className="font-medium text-lg text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md">{submissionData.assignment_name}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="group">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Student Email</h3>
                <p className="font-medium text-lg text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  {submissionData.student_email}
                </p>
              </div>
              
              <div className="group">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Submitted On</h3>
                <p className="font-medium text-lg text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm transition-all duration-300 group-hover:shadow-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {formatDate(submissionData.submitted_date)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg text-center">
          <p className="text-gray-600 dark:text-gray-300">No submission details found.</p>
        </div>
      )}
    </div>
  );
};

export default DisplayAssignmentDetails;