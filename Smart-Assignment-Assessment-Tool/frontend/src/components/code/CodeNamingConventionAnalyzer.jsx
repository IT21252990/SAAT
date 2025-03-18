import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Alert, Button, Progress, Spinner } from 'flowbite-react';
import {
  CodeBracketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const CodeNamingConventionAnalyzer = ({ github_url, code_id, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Fetch existing results on component mount
  useEffect(() => {
    fetchExistingResults();
  }, [code_id]);

  const fetchExistingResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/naming/code-naming-convention-results`,
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

  const analyzeCodeNaming = async () => {
    setIsAnalyzing(true);
    setProgress(0);
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

      // Make API call to check code naming conventions
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/naming/check-code-naming-conventions`,
        {
          code_id: code_id,
          repo_url: github_url,
        },
      );

      clearInterval(progressInterval);
      setProgress(100);
      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze code naming conventions");
      clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const renderIssuesList = () => {
    if (!results || results.status === "Yes") return null;

    return (
      <div className="mt-4">
        <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
          Code elements with naming issues:
        </h3>
        <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <ul className="space-y-2">
            {results.issues.map((issue, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md bg-white p-2 shadow-sm dark:bg-gray-700"
              >
                <XCircleIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {issue.element_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">File:</span> {issue.file_path}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Line:</span> {issue.line_number}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Type:</span> {issue.element_type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Suggested:</span> {issue.suggested_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Issue:</span> {issue.reason}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <>
      {onBack && (
        <button
          onClick={onBack}
          className="hover:bg-primary-50 text-primary-700 dark:text-primary-300 mb-6 inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm transition-all duration-300 hover:shadow dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          <svg
            className="mr-2 h-4 w-4"
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
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Code Naming Convention Analysis
            </h2>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={fetchExistingResults}
              disabled={isLoading || isAnalyzing}
              color="light"
              className="rounded-lg px-2 py-2 text-sm font-medium dark:bg-gray-700 lg:px-3 lg:py-2"
            >
              <ArrowPathIcon className="mr-2 h-5 w-5" />
              Refresh
            </Button>

            <Button
              onClick={analyzeCodeNaming}
              disabled={isAnalyzing || isLoading}
              className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 rounded-lg px-2 py-2 text-sm font-medium text-white focus:outline-none focus:ring-4 lg:px-3 lg:py-2"
            >
              {isAnalyzing ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <CodeBracketIcon className="mr-2 h-5 w-5" />
              )}
              {isAnalyzing ? "Analyzing..." : "Re-analyze"}
            </Button>
          </div>
        </div>

        {(isAnalyzing || isLoading) && (
          <div className="mb-4">
            <div className="mb-1 flex justify-between">
              <span className="text-primary-700 text-sm font-medium dark:text-white">
                {isAnalyzing ? "Analyzing code elements..." : "Loading results..."}
              </span>
              {isAnalyzing && (
                <span className="text-primary-700 text-sm font-medium dark:text-white">
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
                No analysis results found. Click "Re-analyze" to check code naming conventions.
              </span>
            </div>
          </Alert>
        )}

        {results && !isAnalyzing && !isLoading && (
          <div className="mt-4">
            {results.status === "Yes" ? (
              <Alert color="success" className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                All code elements follow proper naming conventions!
              </Alert>
            ) : (
              <div>
                <Alert color="warning" className="mb-4">
                  <div className="flex items-center gap-2">
                    <XCircleIcon className="h-5 w-5" />
                    <span>
                      Found {results.issues.length}{" "}
                      {results.issues.length === 1 ? "issue" : "issues"} with code naming conventions.
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

export default CodeNamingConventionAnalyzer;