import { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button, Progress, Spinner } from 'flowbite-react';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const CodeCommentsAccuracyAnalyzer = ({ github_url, code_id, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  

  // Update the useEffect hook to trigger analysis if no results exist
  useEffect(() => {
      const fetchData = async () => {
        setIsInitialLoading(true);
        await fetchExistingResults();
        // If no results exist, automatically analyze
        if (!results || shouldReanalyze(results.analyzed_at)) {
    await analyzeCodeComments();
  }
        setIsInitialLoading(false);
      };
      fetchData();
    }, [code_id]);

  const fetchExistingResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/naming/code-comments-accuracy-results`,
        { params: { code_id } },
      );

      const resultsData = response.data.code_naming_convention_results;

      if (resultsData && Object.keys(resultsData).length > 0) {
        setResults(resultsData);
      } else {
        setResults(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to fetch existing analysis results",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCodeComments = async (isManual = false) => {
  if (isManual) {
    setIsAnalyzing(true);
    setProgress(0);
  }
  setError(null);

    try {
      // Simulate progress while waiting for API response
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      // Make API call to check code comments accuracy
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/naming/check-code-comments-accuracy`,
        {
          code_id: code_id,
          repo_url: github_url,
        },
      );

      clearInterval(progressInterval);
      setProgress(100);
      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze");
  if (isManual) {
    clearInterval(progressInterval);
    setProgress(0);
  }
    } finally {
      if (isManual) {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
    }
  };

  const shouldReanalyze = (lastAnalyzed) => {
  if (!lastAnalyzed) return true;
  const lastDate = new Date(lastAnalyzed);
  const now = new Date();
  return (now - lastDate) > (24 * 60 * 60 * 1000); // Re-analyze if older than 24 hours
};


  const renderIssuesList = () => {
    if (!results || results.status === "Pass") return null;

    return (
      <div className="mt-4">
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          Comments with accuracy issues:
        </h3>
        <div className="p-4 overflow-y-auto rounded-lg max-h-96 bg-gray-50 dark:bg-gray-800">
          <ul className="space-y-2">
            {results.issues.map((issue, index) => (
              <li
                key={index}
                className="flex items-start gap-2 p-2 bg-white rounded-md shadow-sm dark:bg-gray-700"
              >
                <XCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">File:</span> {issue.file_path}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Line:</span> {issue.line_number}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Type:</span> {issue.comment_type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Current comment:</span> "{issue.actual_comment}"
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Issue:</span> {issue.issue}
                  </p>
                  <div className="p-2 mt-2 bg-gray-100 rounded-md dark:bg-gray-600">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Suggested improvement:</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line dark:text-gray-300">
                      {issue.suggestion}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  if (isInitialLoading) {
        return (
          <div className="flex items-center justify-center p-8">
        <Spinner size="xl" />
        <span className="ml-2 text-black dark:text-white">Initial analysis in progress...</span>
      </div>
        );
      }

  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 mb-6 transition-all duration-300 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-primary-50 text-primary-700 dark:text-primary-300 hover:shadow dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Repository Analysis Tools
        </button>
      )}
      <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Code Comments Accuracy Analysis
            </h2>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={fetchExistingResults}
              disabled={isLoading || isAnalyzing}
              color="light"
              className="px-2 py-2 text-sm font-medium rounded-lg dark:bg-gray-700 lg:px-3 lg:py-2"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </Button>

            <Button
              onClick={() => analyzeCodeComments(true)}
              disabled={isAnalyzing || isLoading}
              className="px-2 py-2 text-sm font-medium text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 focus:outline-none focus:ring-4 lg:px-3 lg:py-2"
            >
              {isAnalyzing ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <DocumentTextIcon className="w-5 h-5 mr-2" />
              )}
              {isAnalyzing ? "Analyzing..." : "Re-analyze"}
            </Button>
          </div>
        </div>

        {(isAnalyzing || isLoading) && (
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-primary-700 dark:text-white">
                {isAnalyzing ? "Analyzing code comments..." : "Loading results..."}
              </span>
              {isAnalyzing && (
                <span className="text-sm font-medium text-primary-700 dark:text-white">
                  {progress}%
                </span>
              )}
            </div>
            <Progress
              progress={isAnalyzing ? progress : 100}
              color={isAnalyzing ? "blue" : "gray"}
              size="md"
            />
          </div>
        )}

        {error && (
          <Alert color="failure" className="mb-4">
            <span className="font-medium">Error:</span> {error}
          </Alert>
        )}

        {!isLoading && !isAnalyzing && !results && !error && (
          <Alert color="info" className="mb-4">
            <div className="flex items-center gap-2">
              <span>
                No analysis results found. Click "Re-analyze" to check code comments accuracy.
              </span>
            </div>
          </Alert>
        )}

        {results && !isAnalyzing && !isLoading && (
          <div className="mt-4">
            {results.status === "Pass" ? (
              <Alert color="success" className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                All code comments accurately describe their corresponding code!
              </Alert>
            ) : (
              <div>
                <Alert color="warning" className="mb-4">
                  <div className="flex items-center gap-2">
                    <XCircleIcon className="w-5 h-5" />
                    <span>
                      Found {results.issues.length}{" "}
                      {results.issues.length === 1 ? "issue" : "issues"} with code comments accuracy.
                    </span>
                  </div>
                </Alert>
                {renderIssuesList()}
              </div>
            )}

            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Last analyzed:{" "}
              {results.analyzed_at
                ? new Date(results.analyzed_at).toLocaleString()
                : "Unknown"}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CodeCommentsAccuracyAnalyzer;