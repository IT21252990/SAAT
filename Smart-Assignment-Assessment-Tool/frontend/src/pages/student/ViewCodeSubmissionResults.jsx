import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import { Card, Button, Spinner, Alert, Badge } from "flowbite-react";
import { HiArrowLeft, HiX, HiDocumentDownload, HiUpload, HiCalendar, HiClock } from "react-icons/hi";
import CodeSubmissionResultsDisplay from "../../components/code/CodeSubmissionResultsDisplay";

const ViewCodeSubmissionResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { codeId, submissionId } = location.state || {};
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const dismissError = () => {
    setError("");
  };

  useEffect(() => {
    if (!codeId || !submissionId) {
      setError("Missing code ID or submission ID");
      setLoading(false);
      return;
    }
    console.log("Code ID:", codeId);
    console.log("Submission ID:", submissionId);
    // You can add any data fetching logic here if needed
    setLoading(false);
  }, [codeId, submissionId]);

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
          Back to Submission Results
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
            {codeId && submissionId ? (
              <CodeSubmissionResultsDisplay codeId={codeId} submission_id={submissionId} />
            ) : (
              <Alert color="failure">
                Missing required parameters to display code analysis
              </Alert>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewCodeSubmissionResults;