import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import { Card, Alert, Button } from "flowbite-react";
import { HiArrowLeft, HiOutlineCode, HiDocumentText, HiVideoCamera, HiChevronRight, HiExclamation } from "react-icons/hi";

const VivaDashboard = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [submissionData, setSubmissionData] = useState(null);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState({});

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

  const fetchQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/question/getBySubmission/${submissionId}`
      );
  
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions || []);
      } else {
        console.error("Failed to fetch questions");
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchSubmissionDetails();
    fetchQuestions();
  }, [submissionId]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'code':
        return '💻';
      case 'theory':
        return '📚';
      case 'practical':
        return '🔍';
      default:
        return '📌';
    }
  };

  const toggleAnswerExpansion = (questionId) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Function to go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>
      
      {/* Main content with padding to account for fixed header */}
      <main className="container px-4 pt-24 pb-8 mx-auto">
        {/* Main Content Card */}
        <Button color="light" onClick={handleGoBack} className="mb-4 mr-4">
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Submissions
          </Button>
        <div className="mb-8 overflow-hidden bg-white shadow-lg rounded-xl dark:bg-gray-800">
          {/* Header with gradient background */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-600 to-gray-800">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-white">
                Viva Dashboard
              </h2>
              <Button
                onClick={() => navigate(`/generate-viva-questions/${submissionId}`)}
                color="green"
                className="flex items-center justify-center gap-2 mt-3 font-medium md:mt-0 hover:bg-white/90"
              >
                <span className="text-lg"> Generate Questions 💡 </span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <Alert color="failure" className="mb-6">
                <span>{error}</span>
              </Alert>
            )}

            {/* Submission Details */}
            {submissionData ? (
              <Card className="mb-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start">
                      <span className="w-32 font-medium text-gray-500 dark:text-gray-400">Module:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{submissionData.module_name}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-32 font-medium text-gray-500 dark:text-gray-400">Assignment:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{submissionData.assignment_name}</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-start">
                      <span className="w-32 font-medium text-gray-500 dark:text-gray-400">Student:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{submissionData.student_email}</span>
                    </div>
                    <div className="flex items-start">
                      <span className="w-32 font-medium text-gray-500 dark:text-gray-400">Submitted:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {new Date(submissionData.submitted_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="flex space-x-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700"></div>
                  <div className="flex-1 py-1 space-y-4">
                    <div className="w-3/4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                      <div className="w-5/6 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Section */}
            <div className="mt-8">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Viva Questions
                </h3>
                <span className="ml-3 bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-primary-900 dark:text-primary-300">
                  {questions.length} Questions
                </span>
              </div>
              
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary-600"></div>
                </div>
              ) : questions.length > 0 ? (
                <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="w-16 px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                            Type
                          </th>
                          <th scope="col" className="w-20 px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                            Metric
                          </th>
                          <th scope="col" className="w-24 px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                            Difficulty
                          </th>
                          <th scope="col" className="w-1/3 px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                            Question
                          </th>
                          <th scope="col" className="w-1/3 px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                            Answer
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 dark:bg-gray-800">
                        {questions.map((question, index) => {
                          const questionId = `${question.document_id}-${index}`;
                          const isExpanded = expandedAnswers[questionId];
                          
                          return (
                            <tr 
                              key={questionId}
                              className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <td className="px-4 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <span className="mr-1">{getTypeIcon(question.type)}</span>
                                  <span className="text-sm font-medium text-gray-900 capitalize dark:text-white">
                                    {question.type}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  {question.metric_type}
                                </span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-900 break-words dark:text-white">
                                  {question.question_text}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className={`text-sm text-gray-700 dark:text-gray-300 ${isExpanded ? '' : 'line-clamp-3'} break-words`}>
                                  {question.answer}
                                </div>
                                <button 
                                  onClick={() => toggleAnswerExpansion(questionId)}
                                  className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                >
                                  {isExpanded ? 'Show less' : 'View full answer'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-gray-300 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <svg className="w-16 h-16 mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No questions found for this submission</p>
                  <p className="mt-2 text-center text-gray-500 dark:text-gray-500">Generate new viva questions using the button above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VivaDashboard;