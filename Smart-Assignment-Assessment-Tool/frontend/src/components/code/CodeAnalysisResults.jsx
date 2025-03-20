import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextInput, 
  Textarea, 
  Card, 
  Alert,
  Spinner
} from "flowbite-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CodeAnalysisResults = ({ codeId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileNamingResults, setFileNamingResults] = useState({});
  const [codeNamingResults, setCodeNamingResults] = useState({});
  const [commentsAccuracyResults, setCommentsAccuracyResults] = useState({});
  const [evaluatorComments, setEvaluatorComments] = useState({});
  const [finalFeedback, setFinalFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    // Show loading state
    setGeneratingPDF(true);
  
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margins = 15;
  
      // Store the current active tab
      const currentTab = activeTab;
      
      // Add title to the PDF
      pdf.setFontSize(18);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Code Analysis Report', pdfWidth / 2, 20, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pdfWidth / 2, 30, { align: 'center' });
      pdf.line(margins, 35, pdfWidth - margins, 35);
      
      // Function to capture each tab content
      const captureTabContent = async (tabIndex, yPosition) => {
        // Set the active tab to render its content
        setActiveTab(tabIndex);
        
        // Wait for the DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get the tab content element
        const tabContentElement = document.getElementById(`tab-content-${tabIndex}`);
        
        if (tabContentElement) {
          // Convert the tab content to canvas
          const canvas = await html2canvas(tabContentElement, {
            scale: 2,
            useCORS: true,
            logging: false
          });
          
          // Convert canvas to image
          const imgData = canvas.toDataURL('image/png');
          
          // Calculate the image dimensions to fit within the PDF
          const imgWidth = pdfWidth - (2 * margins);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add a new page if the content doesn't fit
          if (yPosition + imgHeight > pdfHeight - margins) {
            pdf.addPage();
            yPosition = margins;
          }
          
          // Add section title
          pdf.setFontSize(14);
          pdf.text(tabs[tabIndex].title, margins, yPosition);
          
          // Add image to PDF
          pdf.addImage(imgData, 'PNG', margins, yPosition + 5, imgWidth, imgHeight);
          
          // Return the new Y position for the next content
          return yPosition + imgHeight + 20;
        }
        
        return yPosition + 10;
      };
      
      // Capture content from all tabs
      let yPosition = 45;
      
      for (let i = 0; i < tabs.length; i++) {
        yPosition = await captureTabContent(i, yPosition);
        
        // Add a new page if not the last tab
        if (i < tabs.length - 1) {
          pdf.addPage();
          yPosition = margins;
        }
      }
      
      // Reset to the original tab
      setActiveTab(currentTab);
      
      // Save the PDF
      pdf.save('code-analysis-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  useEffect(() => {
    if (!codeId) {
      setError("No code ID provided. Please select a repository to analyze.");
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all the data in parallel for better performance
        const [
          fileNamingResponse,
          codeNamingResponse,
          commentsAccuracyResponse,
          evaluatorCommentsResponse,
          finalFeedbackResponse
        ] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/naming/file-naming-convention-results?code_id=${codeId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/naming/code-naming-convention-results?code_id=${codeId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/naming/code-comments-accuracy-results?code_id=${codeId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/code-comments?code_id=${codeId}`),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/get-final-feedback?code_id=${codeId}`)
        ]);
        
        // Process responses
        if (!fileNamingResponse.ok) throw new Error("Failed to fetch file naming results");
        if (!codeNamingResponse.ok) throw new Error("Failed to fetch code naming results");
        if (!commentsAccuracyResponse.ok) throw new Error("Failed to fetch comments accuracy results");
        if (!evaluatorCommentsResponse.ok) throw new Error("Failed to fetch evaluator comments");
        if (!finalFeedbackResponse.ok) throw new Error("Failed to fetch final feedback");
        
        const fileNamingData = await fileNamingResponse.json();
        const codeNamingData = await codeNamingResponse.json();
        const commentsAccuracyData = await commentsAccuracyResponse.json();
        const evaluatorCommentsData = await evaluatorCommentsResponse.json();
        const finalFeedbackData = await finalFeedbackResponse.json();
        
        // Update state with fetched data
        setFileNamingResults(fileNamingData.file_naming_convention_results || {});
        setCodeNamingResults(codeNamingData.code_naming_convention_results || {});
        setCommentsAccuracyResults(commentsAccuracyData.code_naming_convention_results || {});
        setEvaluatorComments(evaluatorCommentsData.comments || {});
        
        // Make sure finalFeedback is always a string
        const feedbackText = finalFeedbackData.final_feedback;
        setFinalFeedback(typeof feedbackText === 'string' ? feedbackText : '');
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to fetch data: ${err.message || "Please try again later."}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [codeId]);
  
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    
    // Ensure finalFeedback is a string and not empty before trimming
    const feedbackText = String(finalFeedback || '');
    if (!feedbackText.trim()) {
      setFeedbackError("Please enter feedback before submitting");
      return;
    }
    
    if (!codeId) {
      setFeedbackError("No code ID available. Cannot save feedback.");
      return;
    }
    
    setSubmittingFeedback(true);
    setFeedbackSuccess(false);
    setFeedbackError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/save-final-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code_id: codeId,
          feedback: feedbackText
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setFeedbackSuccess(true);
        // Clear any previous errors
        setFeedbackError(null);
        
        // Keep success message visible for a few seconds
        setTimeout(() => {
          setFeedbackSuccess(false);
        }, 3000);
      } else {
        setFeedbackError(data.error || "Failed to save feedback. Server returned an error.");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setFeedbackError("Network error while submitting feedback. Please try again.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderFileNamingSection = () => {
    if (!fileNamingResults || Object.keys(fileNamingResults).length === 0) {
      return <p className="text-gray-600 dark:text-gray-400">No file naming convention results available.</p>;
    }
  
    return (
      <div className="space-y-4">
        {fileNamingResults.status === "Yes" ? (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-900">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-600 bg-green-100 rounded-full dark:bg-green-800 dark:text-green-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </span>
              <p className="font-medium text-green-700 dark:text-green-200">All files follow proper naming conventions!</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </span>
                <p className="font-medium text-amber-700 dark:text-amber-200">
                  Found {fileNamingResults.invalid_files?.length || 0}{" "}
                  {(fileNamingResults.invalid_files?.length || 0) === 1 ? "file" : "files"}{" "}
                  with naming convention issues.
                </p>
              </div>
            </div>
  
            {fileNamingResults.invalid_files && fileNamingResults.invalid_files.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Files with naming issues:
                </h3>
                <div className="p-4 overflow-y-auto border border-gray-200 rounded-lg shadow-sm max-h-96 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <ul className="space-y-3">
                    {fileNamingResults.invalid_files.map((file, index) => (
                      <li
                        key={index}
                        className="p-3 transition-all bg-white border border-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {file.file_name}
                            </p>
                            <div className="mt-1 space-y-1 text-sm">
                              <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Path:</span> {file.path}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Issue:</span> {file.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
  
        {fileNamingResults.analyzed_at && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Last analyzed:{" "}
            {new Date(fileNamingResults.analyzed_at).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  const renderCodeNamingSection = () => {
    if (!codeNamingResults || Object.keys(codeNamingResults).length === 0) {
      return <p className="text-gray-600 dark:text-gray-400">No code naming convention results available.</p>;
    }
  
    return (
      <div className="space-y-4">
        {codeNamingResults.status === "Yes" ? (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-900">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-600 bg-green-100 rounded-full dark:bg-green-800 dark:text-green-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </span>
              <p className="font-medium text-green-700 dark:text-green-200">All code elements follow proper naming conventions!</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </span>
                <p className="font-medium text-amber-700 dark:text-amber-200">
                  Found {codeNamingResults.issues?.length || 0}{" "}
                  {(codeNamingResults.issues?.length || 0) === 1 ? "issue" : "issues"} with code naming conventions.
                </p>
              </div>
            </div>
  
            {codeNamingResults.issues && codeNamingResults.issues.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
                  Code elements with naming issues:
                </h3>
                <div className="p-4 overflow-y-auto border border-gray-200 rounded-lg shadow-sm max-h-96 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <ul className="space-y-3">
                    {codeNamingResults.issues.map((issue, index) => (
                      <li
                        key={index}
                        className="p-3 transition-all bg-white border border-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <span className="inline-flex items-center justify-center flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {issue.element_name}
                            </p>
                            <div className="mt-1 space-y-1 text-sm">
                              <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
                                <p className="text-gray-600 dark:text-gray-300">
                                  <span className="font-medium text-gray-700 dark:text-gray-200">File:</span> {issue.file_path}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                  <span className="font-medium text-gray-700 dark:text-gray-200">Line:</span> {issue.line_number}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                  <span className="font-medium text-gray-700 dark:text-gray-200">Type:</span> {issue.element_type}
                                </p>
                                <p className="text-gray-600 dark:text-gray-300">
                                  <span className="font-medium text-gray-700 dark:text-gray-200">Suggested:</span> {issue.suggested_name}
                                </p>
                              </div>
                              <p className="pt-2 mt-2 text-gray-600 border-t border-gray-100 dark:text-gray-300 dark:border-gray-600">
                                <span className="font-medium text-gray-700 dark:text-gray-200">Issue:</span> {issue.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
  
        {codeNamingResults.analyzed_at && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Last analyzed:{" "}
            {new Date(codeNamingResults.analyzed_at).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  const renderCommentsAccuracySection = () => {
    if (!commentsAccuracyResults || Object.keys(commentsAccuracyResults).length === 0) {
      return <p className="text-gray-600 dark:text-gray-400">No comments accuracy analysis results available.</p>;
    }
  
    const renderIssuesList = () => {
      if (!commentsAccuracyResults || commentsAccuracyResults.status === "Pass") return null;
  
      return (
        <div className="mt-6">
          <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
            Comments with accuracy issues:
          </h3>
          <div className="p-4 overflow-y-auto border border-gray-200 rounded-lg shadow-sm max-h-96 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <ul className="space-y-3">
              {commentsAccuracyResults.issues && commentsAccuracyResults.issues.map((issue, index) => (
                <li
                  key={index}
                  className="p-3 transition-all bg-white border border-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center justify-center flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-red-100 dark:bg-red-800/30 text-red-500 dark:text-red-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </span>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium text-gray-700 dark:text-gray-200">File:</span> {issue.file_path}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium text-gray-700 dark:text-gray-200">Line:</span> {issue.line_number}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          <span className="font-medium text-gray-700 dark:text-gray-200">Type:</span> {issue.comment_type}
                        </p>
                      </div>
                      
                      <div className="p-2 mt-2 text-sm border border-gray-200 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                        <p className="mb-1 text-gray-600 dark:text-gray-300">
                          <span className="font-medium text-gray-700 dark:text-gray-200">Current comment:</span>
                        </p>
                        <p className="italic text-gray-600 dark:text-gray-400">"{issue.actual_comment}"</p>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Issue:</span> {issue.issue}
                      </p>
                      
                      <div className="p-3 mt-3 border border-blue-100 rounded-md bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <p className="mb-1 text-sm font-medium text-blue-700 dark:text-blue-300">Suggested improvement:</p>
                        <p className="text-sm text-blue-600 whitespace-pre-line dark:text-blue-300">
                          {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    };
  
    return (
      <div className="space-y-4">
        {commentsAccuracyResults.status === "Pass" ? (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-900">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-600 bg-green-100 rounded-full dark:bg-green-800 dark:text-green-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </span>
              <p className="font-medium text-green-700 dark:text-green-200">All code comments accurately describe their corresponding code!</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </span>
                <p className="font-medium text-amber-700 dark:text-amber-200">
                  Found {commentsAccuracyResults.issues?.length || 0}{" "}
                  {(commentsAccuracyResults.issues?.length || 0) === 1 ? "issue" : "issues"} with code comments accuracy.
                </p>
              </div>
            </div>
            {renderIssuesList()}
          </div>
        )}
  
        {commentsAccuracyResults.analyzed_at && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Last analyzed:{" "}
            {new Date(commentsAccuracyResults.analyzed_at).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  const renderEvaluatorCommentsSection = () => {
    if (!evaluatorComments || Object.keys(evaluatorComments).length === 0) {
      return (
        <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-blue-600 bg-blue-100 rounded-full dark:bg-blue-800 dark:text-blue-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </span>
            <p className="font-medium text-gray-700 dark:text-gray-200">No evaluator comments available for this repository.</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        {Object.entries(evaluatorComments).map(([filename, lineComments]) => (
          <div key={filename} className="overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h5 className="font-semibold text-gray-900 dark:text-white">{filename}</h5>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(lineComments).map(([lineNumber, comments]) => (
                <div key={`${filename}-${lineNumber}`} className="p-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center justify-center w-6 h-6 mr-3 text-xs font-medium text-white bg-blue-600 rounded-full dark:bg-blue-500">
                      {lineNumber}
                    </div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Line {lineNumber}</p>
                  </div>
                  
                  <div className="pl-9">
                    <ul className="space-y-2">
                      {comments.map((comment, index) => (
                        <li key={index} className="flex">
                          <span className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 mt-0.5 mr-2 text-blue-600 bg-blue-100 rounded-full dark:bg-blue-800/30 dark:text-blue-300">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                          </span>
                          <div className="text-sm text-gray-700 dark:text-gray-300">{comment}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFinalFeedbackSection = () => {
    // Ensure finalFeedback is a string for safe operations
    const feedbackText = String(finalFeedback || '');
    
    return (
      <div className="space-y-6">
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
          <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <h5 className="font-semibold text-gray-900 dark:text-white">Add or Edit Feedback</h5>
          </div>
          
          <div className="p-5">
            {feedbackSuccess && (
              <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-900">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-600 bg-green-100 rounded-full dark:bg-green-800 dark:text-green-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                  <p className="font-medium text-green-700 dark:text-green-200">Feedback saved successfully!</p>
                </div>
              </div>
            )}
            
            {feedbackError && (
              <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-900">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-600 bg-red-100 rounded-full dark:bg-red-800 dark:text-red-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </span>
                  <p className="font-medium text-red-700 dark:text-red-200">{feedbackError}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label htmlFor="feedback" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Final Repository Feedback
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Enter comprehensive feedback for this repository. Include strengths, areas for improvement, and specific recommendations..."
                  value={feedbackText}
                  onChange={(e) => setFinalFeedback(e.target.value)}
                  rows={8}
                  className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  This feedback will be stored permanently with the repository analysis.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button 
                  type="submit" 
                  disabled={submittingFeedback || !feedbackText.trim()}
                  className="w-full sm:w-auto"
                  color="blue"
                >
                  {submittingFeedback ? (
                    <div className="flex items-center justify-center">
                      <Spinner size="sm" className="mr-3" />
                      <span>Saving feedback...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Save Feedback
                    </div>
                  )}
                </Button>
  
                {feedbackText.trim() && (
                  <Button 
                    type="button" 
                    color="light"
                    onClick={() => setFinalFeedback("")}
                    className="w-full sm:w-auto"
                  >
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Clear Input
                    </div>
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
  
        {/* Current Saved Feedback Section */}
        {feedbackText.trim() && !feedbackError && !submittingFeedback && (
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h5 className="font-semibold text-gray-900 dark:text-white">Current Saved Feedback</h5>
            </div>
            
            <div className="p-5">
              <div className="p-4 overflow-auto whitespace-pre-wrap border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 max-h-96">
                <p className="text-gray-700 dark:text-gray-300">{feedbackText}</p>
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner size="lg" />
        <p className="mt-4">Loading code analysis results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert color="failure" className="max-w-lg">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  // Custom tabs data
  const tabs = [
    {
      id: 0,
      title: "File Naming",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    },
    {
      id: 1,
      title: "Code Naming",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
        </svg>
      )
    },
    {
      id: 2,
      title: "Comments Accuracy",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      id: 3,
      title: "Evaluator Comments",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
      )
    },
    {
      id: 4,
      title: "Final Feedback",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      )
    }
  ];

  // Define the tab content based on activeTab
  const tabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div id="tab-content-0">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">File Naming Convention Results</h2>
            {renderFileNamingSection()}
          </div>
        );
      case 1:
        return (
          <div id="tab-content-1">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Code Naming Convention Results</h2>
            {renderCodeNamingSection()}
          </div>
        );
      case 2:
        return (
          <div id="tab-content-2">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Comments Accuracy Analysis</h2>
            {renderCommentsAccuracySection()}
          </div>
        );
      case 3:
        return (
          <div id="tab-content-3">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Evaluator Comments</h2>
            {renderEvaluatorCommentsSection()}
          </div>
        );
      case 4:
        return (
          <div id="tab-content-4">
            <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Final Feedback</h2>
            {renderFinalFeedbackSection()}
          </div>
        );
      default:
        return <p className="text-gray-600 dark:text-gray-400">Select a tab to view content</p>;
    }
  };

  return (
    <div className="container py-6 mx-auto space-y-6 font-sans animate-slide-in-right">
      <Card className="border-0 shadow-lg">
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">Code Analysis Results</h1>
          <div className="flex items-center gap-3">
          {/* Generate Report Button */}
          <Button
            onClick={generatePDF}
            disabled={generatingPDF}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
          >
            {generatingPDF ? (
              <>
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Generate Report
              </>
            )}
          </Button>
          {/* Add a subtle loading indicator if needed */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 mr-1 bg-green-500 rounded-full"></div>
            Analysis Complete
          </div>
        </div>
            </div>
        {/* Enhanced Tabs Implementation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px">
            {tabs.map((tab) => (
              <li key={tab.id} className="mr-2">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-4 py-3 rounded-t-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-gray-50 dark:bg-gray-800 font-medium'
                      : 'text-gray-500 dark:text-gray-400 border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Tab content with proper styling */}
        <div className="p-4 mt-4 bg-white rounded-lg dark:bg-gray-800">
          {tabContent()}
        </div>
      </Card>

      {/* Loading indicator placeholder (can be conditionally rendered) */}
      <div className="hidden">
        <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <div className="mr-3">
            <svg className="w-6 h-6 animate-spin text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-primary-600 dark:text-primary-400">Loading analysis results...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeAnalysisResults;