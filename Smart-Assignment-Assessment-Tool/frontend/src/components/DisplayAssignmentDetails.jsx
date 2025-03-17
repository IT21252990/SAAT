import React, { useState, useEffect } from "react";
import { Card, Alert } from "flowbite-react"; 

const DisplayAssignmentDetails = ({ submission_id }) => {
  const [submissionData, setSubmissionData] = useState(null);
  const [error, setError] = useState("");

  const fetchSubmissionDetails = async () => {
      try {
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
      }
    };
  
    useEffect(() => {
      fetchSubmissionDetails();
    }, [submission_id]);

  return (
    <div className="mb-10 mt-10 w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Submission Details
            </h2>
    
            {error && (
              <Alert color="failure" className="mb-4">
                <span>{error}</span>
              </Alert>
            )}
    
            {submissionData ? (
              <Card className="space-y-4 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                <div className="flex flex-col">
                <p>
                    <strong>Submission ID:</strong> {submissionData.submission_id}
                  </p>
                  <p>
                    <strong>Module Name:</strong> {submissionData.module_name}
                  </p>
                  <p>
                    <strong>Assignment Name:</strong> {submissionData.assignment_name}
                  </p>
                  <p>
                    <strong>Student Email:</strong> {submissionData.student_email}
                  </p>
                  <p>
                    <strong>Submitted On:</strong>{" "}
                    {new Date(submissionData.submitted_date).toLocaleString()}
                  </p>
                  {/* Add more details if necessary */}
                </div>
              </Card>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">Loading submission details...</p>
            )}
          </div>
  );
};

export default DisplayAssignmentDetails;
