import React, { useState } from 'react';
import axios from 'axios';
import { Alert, Button, Progress, Spinner } from 'flowbite-react';
import { CodeBracketIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const NamingConventionAnalyzer = ({ github_url, code_id }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeRepo = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    
    try {
      // Simulate progress while waiting for API response
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 500);

      // Make API call to check naming conventions
      const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/naming/check-file-naming-conventions`,
      {
        code_id: code_id,
        repo_url: github_url      }
    );

      clearInterval(progressInterval);
      setProgress(100);
      setResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze repository');
      clearInterval(progressInterval);
      setProgress(0);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const renderFileList = () => {
    if (!results || results.status === 'Yes') return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Files with naming issues:
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
          <ul className="space-y-2">
            {results.invalid_files.map((file, index) => (
              <li key={index} className="flex items-start gap-2 p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {file.file_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Path:</span> {file.path}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Issue:</span> {file.reason}
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Naming Convention Analysis
        </h2>
        
        <Button 
          onClick={analyzeRepo}
          disabled={isAnalyzing}
          className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-2 lg:px-3 py-2 lg:py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
        >
          {isAnalyzing ? (
            <Spinner size="sm" />
          ) : (
            <CodeBracketIcon className="h-5 w-5 mr-4" />
          )}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Code Base'}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-primary-700 dark:text-white">
              Analyzing repository...
            </span>
            <span className="text-sm font-medium text-primary-700 dark:text-white">
              {progress}%
            </span>
          </div>
          <Progress progress={progress} color="blue" />
        </div>
      )}

      {error && (
        <Alert color="failure" className="mb-4">
          <span className="font-medium">Error:</span> {error}
        </Alert>
      )}

      {results && !isAnalyzing && (
        <div className="mt-4">
          {results.status === 'Yes' ? (
            <Alert color="success" className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              All files follow proper naming conventions!
            </Alert>
          ) : (
            <div>
              <Alert color="warning" className="mb-4">
                <div className="flex items-center gap-2">
                  <XCircleIcon className="h-5 w-5" />
                  <span>
                    Found {results.invalid_files.length} {results.invalid_files.length === 1 ? 'file' : 'files'} with naming convention issues.
                  </span>
                </div>
              </Alert>
              {renderFileList()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NamingConventionAnalyzer;