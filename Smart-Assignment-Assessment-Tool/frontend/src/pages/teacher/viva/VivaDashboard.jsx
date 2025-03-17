import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import Header from "../../../components/Header";
import { Card, Alert, Button } from "flowbite-react"; // Import Button from Flowbite

const VivaDashboard = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate(); // Initialize navigation
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
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mb-10 mt-10 w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        {/* Heading with Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Viva Dashboard
          </h2>
          {/* Generate Viva Questions Button */}
          <Button
            onClick={() => navigate(`/generate-viva-questions/${submissionId}`)}
            color="green"
            className="ml-4 text-xl"
          >
            Generate Viva Questions 💡
          </Button>
        </div>

        {error && (
          <Alert color="failure" className="mb-4">
            <span>{error}</span>
          </Alert>
        )}

        {submissionData ? (
          <Card className="space-y-4 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
            <div className="flex flex-col">
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
            </div>
          </Card>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">Loading submission details...</p>
        )}
      </div>
    </div>
  );
};

export default VivaDashboard;
