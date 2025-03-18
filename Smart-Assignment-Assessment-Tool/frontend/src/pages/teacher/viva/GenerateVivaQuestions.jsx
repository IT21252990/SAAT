import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GenerateVivaQuestions = () => {
  const { submissionId } = useParams();
  const [selectedContent, setSelectedContent] = useState(null);
  const [step, setStep] = useState(1);
  const [metrics, setMetrics] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const defaultMetrics = {
    general: [
      "Conceptual Understanding",
      "Problem Solving",
      "Justification & Reflection",
    ],
    code: ["Functionality", "Code Structure", "Error Handling"],
    video: ["Clarity of Explanation", "Demonstration of Work"],
    report: ["Technical Accuracy", "Analysis & Justification"],
  };

  const handleButtonClick = (content) => {
    setSelectedContent(content);
    setMetrics(defaultMetrics[content] || []);
    setStep(2);
  };

  const handleMetricChange = (index, newValue) => {
    const newMetrics = [...metrics];
    newMetrics[index] = newValue;
    setMetrics(newMetrics);
  };

  const handleAddMetric = () => setMetrics([...metrics, ""]);
  const handleRemoveMetric = (index) =>
    setMetrics(metrics.filter((_, i) => i !== index));

  const generateQuestions = async () => {
    try {
      // Define the payload to send to the API
      const requestData = {
        submission_id: submissionId,
        metric_types: metrics,
      };

      // Set API URL based on the selected content
      let apiUrl;
      if (selectedContent === "general") {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/qgenerate/generateGeneralQuestions`;
      } else if (selectedContent === "code") {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/qgenerate/generateCodeQuestions`;
      } else if (selectedContent === "video") {
        apiUrl = "/api/generateVideoQuestions";
      } else if (selectedContent === "report") {
        apiUrl = "/api/generateReportQuestions";
      }

      setLoading(true);
      // Send the POST request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      setLoading(false);

      // Parse response and handle it
      const data = await response.json();

      if (response.ok) {
        // Handle successful response (display questions)
        console.log("Generated Questions:", data);
        setGeneratedQuestions(data.data.questions);
      } else {
        // Handle errors
        console.error("Error generating questions:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleCheckboxChange = (question, level) => {
    const questionId = `${question.metric_type}-${level}-${question.qna[level].question.substring(0, 20)}`;
    
    setSelectedQuestions((prevSelectedQuestions) => {
      // Check if this exact question is already in the array
      const existingIndex = prevSelectedQuestions.findIndex(
        q => q.metric_type === question.metric_type && 
             q.level === level && 
             q.qna[level].question === question.qna[level].question
      );
      
      // If found, remove it; otherwise add it
      if (existingIndex >= 0) {
        return prevSelectedQuestions.filter((_, i) => i !== existingIndex);
      } else {
        const questionCopy = { 
          ...question, 
          level,
          id: questionId  // Add a unique identifier
        };
        return [...prevSelectedQuestions, questionCopy];
      }
    });
  };

  const handleSaveQuestions = async () => {
    if (selectedQuestions.length === 0) {
      // Show warning toast for no questions selected
      toast.warning("Please select at least one question to save.", {
        icon: "⚠️"
      });
      return;
    }
  
    const questionsToSave = selectedQuestions.map((question) => ({
      type: selectedContent,
      metric_type: question.metric_type,
      difficulty: question.level,
      question: question.qna[question.level].question,
      answer: question.qna[question.level].answer,
    }));
  
    // Log to verify data before sending
    console.log("Saving questions:", questionsToSave);
    
    const requestData = {
      submission_id: submissionId,
      questions: questionsToSave,
    };
  
    try {
      // Show loading state
      setIsSaving(true);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/question/saveVivaQuestions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
  
      const result = await response.json();
      if (response.ok) {
        // Show success toast
        toast.success(`${selectedQuestions.length} questions have been saved successfully!`, {
          icon: "✅"
        });
        
        // Reset state and redirect to first step after a brief delay
        setTimeout(() => {
          setSelectedQuestions([]);
          setGeneratedQuestions([]);
          setStep(1);
        }, 1500);
      } else {
        // Show error toast
        toast.error(result.error || "An unexpected error occurred", {
          icon: "❌"
        });
      }
    } catch (error) {
      console.error("Error saving questions:", error);
      // Show network error toast
      toast.error("Unable to connect to the server. Please try again later.", {
        icon: "🔌"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const typeColors = {
    general: "bg-gradient-to-r from-indigo-500 to-purple-500",
    code: "bg-gradient-to-r from-sky-500 to-blue-500",
    video: "bg-gradient-to-r from-green-500 to-teal-500",
    report: "bg-gradient-to-r from-amber-500 to-orange-500"
  };
  
  const typeIcons = {
    general: (
      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    ),
    code: (
      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
      </svg>
    ),
    video: (
      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
      </svg>
    ),
    report: (
      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
            <h1 className="mb-6 text-3xl font-bold text-gray-800 dark:text-white">
              Generate Viva Questions
            </h1>

            {/* Stepper */}
            <div className="mb-10">
              <ol className="flex items-center">
                <li className={`flex items-center ${step >= 1 ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${step >= 1 ? "border-primary-600 bg-primary-600 text-white dark:border-primary-400 dark:bg-primary-400" : "border-gray-500 dark:border-gray-400"}`}>
                    {step > 1 ? "✓" : "1"}
                  </span>
                  <span className="ml-2 text-sm font-medium sm:text-base">Type</span>
                  <div className={`mx-4 h-0.5 w-12 ${step > 1 ? "bg-primary-600 dark:bg-primary-400" : "bg-gray-200 dark:bg-gray-600"}`}></div>
                </li>
                <li className={`flex items-center ${step >= 2 ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${step >= 2 ? "border-primary-600 bg-primary-600 text-white dark:border-primary-400 dark:bg-primary-400" : "border-gray-500 dark:border-gray-400"}`}>
                    {step > 2 ? "✓" : "2"}
                  </span>
                  <span className="ml-2 text-sm font-medium sm:text-base">Metrics</span>
                  <div className={`mx-4 h-0.5 w-12 ${step > 2 ? "bg-primary-600 dark:bg-primary-400" : "bg-gray-200 dark:bg-gray-600"}`}></div>
                </li>
                <li className={`flex items-center ${step >= 3 ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"}`}>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${step >= 3 ? "border-primary-600 bg-primary-600 text-white dark:border-primary-400 dark:bg-primary-400" : "border-gray-500 dark:border-gray-400"}`}>
                    {step > 3 ? "✓" : "3"}
                  </span>
                  <span className="ml-2 text-sm font-medium sm:text-base">Questions</span>
                </li>
              </ol>
            </div>

            {/* Step 1: Select Submission Type */}
            {step === 1 && (
              <div className="mt-6">
                <h2 className="mb-6 text-xl font-semibold text-gray-700 dark:text-gray-200">
                  What type of submission do you want to generate questions for?
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                  {["general", "code", "video", "report"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handleButtonClick(type)}
                      className={`flex flex-col items-center justify-center rounded-xl p-6 shadow-md transition-all duration-200 hover:shadow-lg ${typeColors[type]} text-white transform hover:scale-105`}
                    >
                      {typeIcons[type]}
                      <span className="text-lg font-medium capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Evaluation Metrics */}
            {step === 2 && selectedContent && (
              <div className="mt-6">
                <div className="mb-6 flex items-center">
                  <span className={`mr-3 rounded-full p-2 text-white ${typeColors[selectedContent]}`}>
                    {typeIcons[selectedContent]}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                    Select Evaluation Metrics for{" "}
                    <span className="capitalize">{selectedContent}</span> Questions
                  </h2>
                </div>
                
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  Choose from the available metrics or add custom ones to evaluate student performance.
                </p>
                
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  {metrics.map((metric, index) => (
                    <div key={index} className="mb-4 flex items-center">
                      <input
                        value={metric}
                        onChange={(e) => handleMetricChange(index, e.target.value)}
                        className="grow rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter metric"
                      />
                      <button
                        onClick={() => handleRemoveMetric(index)}
                        className="ml-2 inline-flex items-center rounded-lg border border-red-500 p-2.5 text-center text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-800"
                        aria-label="Remove metric"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={handleAddMetric}
                    className="inline-flex items-center rounded-lg bg-primary-50 px-4 py-2 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/30"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add New Metric
                  </button>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(1)}
                    className="mr-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="rounded-lg bg-primary-600 px-5 py-2.5 text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Generate Questions */}
            {step === 3 && (
              <div className="mt-6">
                <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300">
                        <span className="mr-2 font-semibold">Submission Type:</span>
                        <span className={`rounded-full px-3 py-1 text-sm text-white ${typeColors[selectedContent]}`}>
                          <span className="capitalize">{selectedContent}</span>
                        </span>
                      </p>
                      
                      <div className="mt-4">
                        <p className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
                          Evaluation Metrics:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {metrics.map((metric, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={generateQuestions}
                      disabled={loading}
                      className={`inline-flex items-center rounded-lg px-5 py-2.5 text-center text-white ${loading ? "bg-gray-400 dark:bg-gray-600" : "bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700"}`}
                    >
                      {loading ? (
                        <>
                          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          Generate Questions
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generated Questions */}
                {generatedQuestions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
                      Generated Questions
                    </h3>
                    
                    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Evaluation Metric
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Difficulty
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Question
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Answer
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Select
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                          {generatedQuestions.map((q, index) => {
                            const levels = ["easy", "moderate", "difficult"];
                            return levels.map((level, levelIndex) => {
                              const content = q.qna[level];
                              return (
                                <tr 
                                  key={`${index}-${level}`}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  {levelIndex === 0 && (
                                    <td rowSpan={levels.length} className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                      {q.metric_type}
                                    </td>
                                  )}
                                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                      level === "easy" 
                                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                        : level === "moderate" 
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" 
                                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    }`}>
                                      {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {content.question}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                                    {content.answer}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <input
                                      type="checkbox"
                                      onChange={() => handleCheckboxChange(q, level)}
                                      className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                                    />
                                  </td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                    <button
  onClick={handleSaveQuestions}
  disabled={selectedQuestions.length === 0 || isSaving}
  className={`inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-center text-white hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 ${(selectedQuestions.length === 0 || isSaving) ? "cursor-not-allowed opacity-50" : ""}`}
>
  {isSaving ? (
    <>
      <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Saving...
    </>
  ) : (
    <>
      <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
      </svg>
      Save Selected Questions
    </>
  )}
</button>
                    </div>
                  </div>
                )}
                
                {!loading && generatedQuestions.length === 0 && (
                  <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                    <svg className="mb-3 h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">
                      Click the "Generate Questions" button to create questions based on your selected metrics
                    </p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Back to Metrics
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateVivaQuestions;