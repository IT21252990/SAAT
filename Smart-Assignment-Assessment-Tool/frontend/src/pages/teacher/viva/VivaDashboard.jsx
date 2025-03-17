import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const VivaDashboard = () => {
  const { submissionId } = useParams();
  const [submissionData, setSubmissionData] = useState(null);
  const [error, setError] = useState("");

  const fetchSubmissionDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionData/${submissionId}`
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
  }, [submissionId]);

  return (
    <div className="min-h-screen h-full flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <div className="mt-10 mb-10 w-full max-w-6xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Viva Dashboard
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        {submissionData ? (
          <div className="space-y-4">
            <p><strong>Module Name:</strong> {submissionData.module_name}</p>
            <p><strong>Assignment Name:</strong> {submissionData.assignment_name}</p>
            <p><strong>Student Email:</strong> {submissionData.student_email}</p>
            <p><strong>Submitted On:</strong> {new Date(submissionData.submitted_date).toLocaleString()}</p>
            {/* Add more details as needed */}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">Loading submission details...</p>
        )}
      </div>
    </div>
  );
};

export default VivaDashboard;
