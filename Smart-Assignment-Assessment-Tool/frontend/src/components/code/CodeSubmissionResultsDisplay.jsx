import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextInput, 
  Textarea, 
  Card, 
  Alert,
  Spinner,
  Modal,
  Badge,
  Table
} from "flowbite-react";
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable'
import { FaEdit, FaTrash, FaCheck, FaTimes, FaFilePdf } from 'react-icons/fa';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CodeSubmissionResultsDisplay = ({ codeId , submission_id }) => {
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
  const [assignment_id, setAssignment_id] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSection, setDeleteSection] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const [markingScheme, setMarkingScheme] = useState(null);
  const [marks, setMarks] = useState({});
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksError, setMarksError] = useState(null);
  const [marksSuccess, setMarksSuccess] = useState(false);

  const fetchAssignmentID = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/submission/get-assignment-id/${submission_id}`
      );

      if (response.ok) {
        const data = await response.json();
        setAssignment_id(data.assignment_id);
        return data.assignment_id; // Return the assignment ID
      } else {
        setError("Failed to fetch submission details.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching submission details:", error);
      setError("Error fetching submission details.");
      return null;
    } finally {
      setLoading(false);
    }
  };

const fetchAssignmentDetails = async (assignmentId) => {
  if (!assignmentId) return;
  
  try {
    setLoading(true);
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`
    );

    if (response.ok) {
      const data = await response.json();
      setAssignmentDetails(data);
    } else {
      setError("Failed to fetch Assignment details.");
    }
  } catch (error) {
    console.error("Error fetching Assignment details:", error);
    setError("Error fetching Assignment details.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const fetchData = async () => {
    const assignmentId = await fetchAssignmentID();
    if (assignmentId) {
      await fetchAssignmentDetails(assignmentId);
    }
  };
  
  fetchData();
}, [submission_id]);

useEffect(() => {
  if (!codeId || !assignment_id) return;
  
  const fetchMarkingScheme = async () => {
    try {
      const [schemeResponse, marksResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/marking-scheme/markingScheme/${assignment_id}`),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/get-marks/${codeId}`)
      ]);
      
      if (!schemeResponse.ok) {
        throw new Error("Failed to fetch marking scheme");
      }

      const schemeData = await schemeResponse.json();
      const markingScheme = schemeData.marking_scheme || schemeData;
      
      if (!markingScheme?.marking_schemes?.[0]?.criteria?.code) {
        throw new Error("Marking scheme data is incomplete");
      }

      setMarkingScheme(markingScheme);
      
      // Initialize marks with existing marks or 0
      const initialMarks = {};
      const existingMarks = marksResponse.ok ? (await marksResponse.json()).marks || {} : {};

      markingScheme.marking_schemes[0].criteria.code.forEach(criteria => {
        initialMarks[criteria.criterion] = existingMarks[criteria.criterion] || 0;
      });
      
      setMarks(initialMarks);
      setMarksError(null);
    } catch (err) {
      console.error("Error fetching marking scheme:", err);
      setMarksError(err.message);
      setMarkingScheme(null);
    }
  };

  fetchMarkingScheme();
}, [codeId, assignment_id]);

  // Fetch all required data
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
        const [
          fileNamingData,
          codeNamingData,
          commentsAccuracyData,
          evaluatorCommentsData,
          finalFeedbackData
        ] = await Promise.all([
          fileNamingResponse.json(),
          codeNamingResponse.json(),
          commentsAccuracyResponse.json(),
          evaluatorCommentsResponse.json(),
          finalFeedbackResponse.json()
        ]);
        
        // Update state with fetched data
        setFileNamingResults(fileNamingData.file_naming_convention_results || {});
        setCodeNamingResults(codeNamingData.code_naming_convention_results || {});
        setCommentsAccuracyResults(commentsAccuracyData.code_naming_convention_results || {});
        setEvaluatorComments(evaluatorCommentsData.comments || {});
        setFinalFeedback(typeof finalFeedbackData.final_feedback === 'string' ? finalFeedbackData.final_feedback : '');
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to fetch data: ${err.message || "Please try again later."}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [codeId]);

  // Generate professional PDF report
  const generatePDF = async () => {
    setGeneratingPDF(true);
    setPdfGenerating(true);
    
    try {
      const doc = new jsPDF();
      
      // Set document properties
    doc.setProperties({
      title: `Code Analysis Report - ${assignmentDetails?.name || 'Assignment'}`,
      subject: 'Code Quality Analysis',
      author: 'SAAT',
      keywords: 'code, analysis, quality, report',
      creator: 'Code Analysis Tool'
    });

      // Store page references for TOC
      const pageRefs = {
        fileNaming: null,
        codeNaming: null,
        comments: null,
        evaluatorComments: null,
        markingScheme: null,
        finalFeedback: null
      };

      // Add professional cover page with border
      doc.setDrawColor(40, 53, 147);
      doc.setLineWidth(1);
      doc.rect(10, 10, 190, 277); // Page border

      doc.setFillColor(40, 53, 147);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text('CODE ANALYSIS REPORT', 105, 25, { align: 'center' });

       // Add assignment details to cover page
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text(assignmentDetails?.name || 'Assignment', 105, 60, { align: 'center' });
    
    // Add module name if available
    if (assignmentDetails?.module_name) {
      doc.setFontSize(16);
      doc.text(`Module: ${assignmentDetails.module_name}`, 105, 75, { align: 'center' });
    }

      // Add submission ID
    doc.setFontSize(14);
    doc.text(`Submission ID: ${submission_id}`, 105, 90, { align: 'center' });

    // Add decorative line under title
    doc.setDrawColor(40, 53, 147);
    doc.setLineWidth(0.5);
    doc.line(60, 95, 150, 95);


      // Add footer to cover page
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text('Confidential Report - For Educational Purposes Only', 105, 270, { align: 'center' });

      doc.addPage();

      // Add table of contents with clickable links
      doc.setDrawColor(40, 53, 147);
      doc.rect(10, 10, 190, 277); // Page border
      
      doc.setFontSize(20);
      doc.setTextColor(40, 53, 147);
      doc.text('Table of Contents', 105, 30, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const tocItems = [
        { text: '1. File Naming Analysis', y: 60, ref: 'fileNaming' },
        { text: '2. Code Naming Analysis', y: 70, ref: 'codeNaming' },
        { text: '3. Comments Accuracy Analysis', y: 80, ref: 'comments' },
        { text: '4. Evaluator Comments', y: 90, ref: 'evaluatorComments' },
        { text: '5. Marking Scheme', y: 100, ref: 'markingScheme' },
        { text: '6. Final Feedback', y: 110, ref: 'finalFeedback' }
      ];

      tocItems.forEach(item => {
        doc.text(item.text, 50, item.y);
        // Add dotted line
        doc.setDrawColor(150);
        doc.setLineWidth(0.1);
        doc.line(50, item.y + 2, 160, item.y + 2);
        // Add page number placeholder
        doc.text('...', 165, item.y);
      });

      // Add file naming analysis section
      doc.addPage();
      doc.setDrawColor(40, 53, 147);
      doc.rect(10, 10, 190, 277); // Page border
      pageRefs.fileNaming = doc.internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('1. File Naming Analysis', 20, 30);
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      if (fileNamingResults.status === "Yes") {
        doc.text('✓ All files follow proper naming conventions', 30, 45);
      } else {
        doc.text(`Found ${fileNamingResults.invalid_files?.length || 0} files with naming issues:`, 30, 45);
        
        const fileData = fileNamingResults.invalid_files?.map(file => [
          file.file_name,
          file.path,
          file.reason
        ]) || [];
        
        autoTable(doc, {
          startY: 55,
          head: [['File Name', 'Path', 'Issue']],
          body: fileData,
          theme: 'grid',
          headStyles: {
            fillColor: [40, 53, 147],
            textColor: 255
          },
          margin: { left: 20 }
        });
      }
      
      // Add code naming analysis section
      doc.addPage();
      doc.setDrawColor(40, 53, 147);
      doc.rect(10, 10, 190, 277); // Page border
      pageRefs.codeNaming = doc.internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('2. Code Naming Analysis', 20, 30);
      
      if (codeNamingResults.status === "Yes") {
        doc.setFontSize(12);
        doc.text('✓ All code elements follow proper naming conventions', 30, 45);
      } else {
        doc.setFontSize(12);
        doc.text(`Found ${codeNamingResults.issues?.length || 0} code naming issues:`, 30, 45);
        
        const codeData = codeNamingResults.issues?.map(issue => [
          issue.element_name,
          issue.element_type,
          issue.file_path,
          issue.line_number,
          issue.reason,
          issue.suggested_name
        ]) || [];
        
        autoTable(doc, {
          startY: 55,
          head: [['Element', 'Type', 'File', 'Line', 'Issue', 'Suggestion']],
          body: codeData,
          theme: 'grid',
          headStyles: {
            fillColor: [40, 53, 147],
            textColor: 255
          },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 20 },
            2: { cellWidth: 40 },
            3: { cellWidth: 15 },
            4: { cellWidth: 40 },
            5: { cellWidth: 30 }
          },
          margin: { left: 20 }
        });
      }
      
      // Add comments accuracy section
      doc.addPage();
      doc.setDrawColor(40, 53, 147);
      doc.rect(10, 10, 190, 277); // Page border
      pageRefs.comments = doc.internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('3. Comments Accuracy Analysis', 20, 30);
      
      if (commentsAccuracyResults.status === "Pass") {
        doc.setFontSize(12);
        doc.text('✓ All code comments accurately describe their corresponding code', 30, 45);
      } else {
        doc.setFontSize(12);
        doc.text(`Found ${commentsAccuracyResults.issues?.length || 0} comments with accuracy issues:`, 30, 45);
        
        const commentsData = commentsAccuracyResults.issues?.map(issue => [
          issue.file_path,
          issue.line_number,
          issue.comment_type,
          issue.issue,
          issue.suggestion
        ]) || [];
        
        autoTable(doc, {
          startY: 55,
          head: [['File', 'Line', 'Type', 'Issue', 'Suggestion']],
          body: commentsData,
          theme: 'grid',
          headStyles: {
            fillColor: [40, 53, 147],
            textColor: 255
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 15 },
            2: { cellWidth: 20 },
            3: { cellWidth: 50 },
            4: { cellWidth: 50 }
          },
          margin: { left: 20 }
        });
      }
      
      // Add evaluator comments section
      doc.addPage();
      doc.setDrawColor(40, 53, 147);
      doc.rect(10, 10, 190, 277); // Page border
      pageRefs.evaluatorComments = doc.internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('4. Evaluator Comments', 20, 30);
      
      if (!evaluatorComments || Object.keys(evaluatorComments).length === 0) {
        doc.setFontSize(12);
        doc.text('No evaluator comments available', 30, 45);
      } else {
        let yPosition = 45;
        
        Object.entries(evaluatorComments).forEach(([filename, lineComments]) => {
          if (yPosition > 250) {
            doc.addPage();
            doc.setDrawColor(40, 53, 147);
            doc.rect(10, 10, 190, 277); // Page border
            yPosition = 30;
          }
          
          doc.setFontSize(14);
          doc.setTextColor(0, 0, 0);
          doc.text(filename, 30, yPosition);
          yPosition += 10;
          
          Object.entries(lineComments).forEach(([lineNumber, comments]) => {
            if (yPosition > 250) {
              doc.addPage();
              doc.setDrawColor(40, 53, 147);
              doc.rect(10, 10, 190, 277); // Page border
              yPosition = 30;
            }
            
            doc.setFontSize(12);
            doc.text(`Line ${lineNumber}:`, 35, yPosition);
            yPosition += 7;
            
            comments.forEach(comment => {
              if (yPosition > 250) {
                doc.addPage();
                doc.setDrawColor(40, 53, 147);
                doc.rect(10, 10, 190, 277); // Page border
                yPosition = 30;
              }
              
              doc.setFontSize(10);
              doc.text(`- ${comment}`, 40, yPosition);
              yPosition += 7;
            });
          });
        });
      }

      // Add marking scheme section
    doc.addPage();
    doc.setDrawColor(40, 53, 147);
    doc.rect(10, 10, 190, 277); // Page border
    pageRefs.markingScheme = doc.internal.getCurrentPageInfo().pageNumber;
    
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('5. Marking Scheme', 20, 30);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Add marking scheme title
    doc.text(`Marking Scheme: ${markingScheme.marking_schemes[0].title}`, 20, 45);
    
    // Add submission type weights
    doc.text('Submission Type Weights:', 20, 60);
    const weights = markingScheme.marking_schemes[0].submission_type_weights;
    doc.text(`Code: ${weights.code}%`, 40, 70);
    doc.text(`Report: ${weights.report}%`, 40, 80);
    doc.text(`Video: ${weights.video}%`, 40, 90);
    
    // Add code criteria
    doc.text('Code Assessment Criteria:', 20, 110);
    
    const codeCriteria = markingScheme.marking_schemes[0].criteria.code || [];
    let yPosition = 120;
    
    codeCriteria.forEach((criterion, index) => {
      if (yPosition > 250) {
        doc.addPage();
        doc.setDrawColor(40, 53, 147);
        doc.rect(10, 10, 190, 277); // Page border
        yPosition = 30;
      }
      
      // Criterion title and weight
      doc.setFontSize(14);
      doc.setTextColor(40, 53, 147);
      doc.text(`${index + 1}. ${criterion.criterion} (Weight: ${criterion.weightage}%)`, 20, yPosition);
      yPosition += 10;
      
      // Descriptions
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      doc.text(`High (80-100%): ${criterion.high_description}`, 30, yPosition);
      yPosition += 10;
      
      doc.text(`Medium (50-79%): ${criterion.medium_description}`, 30, yPosition);
      yPosition += 10;
      
      doc.text(`Low (0-49%): ${criterion.low_description}`, 30, yPosition);
      yPosition += 15;
      
      // Add marks if available
      if (marks[criterion.criterion] !== undefined) {
        doc.text(`Awarded Marks: ${marks[criterion.criterion]}%`, 30, yPosition);
        yPosition += 15;
      }
      
      // Add separator line
      doc.setDrawColor(200);
      doc.setLineWidth(0.2);
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 10;
    });
      
      // Add final feedback section
      doc.addPage();
      doc.setDrawColor(40, 53, 147);
      doc.rect(10, 10, 190, 277); // Page border
      pageRefs.finalFeedback = doc.internal.getCurrentPageInfo().pageNumber;
      
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('6. Final Feedback', 20, 30);
      
      if (finalFeedback.trim()) {
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(finalFeedback, 170);
        doc.text(splitText, 30, 45);
      } else {
        doc.setFontSize(12);
        doc.text('No final feedback provided yet', 30, 45);
      }
      
      doc.setPage(2); // Go back to TOC page
      
      tocItems.forEach(item => {
        const pageNumber = pageRefs[item.ref];
        if (pageNumber) {
          // Add the page number
          doc.setTextColor(40, 53, 147);
          doc.text(pageNumber.toString(), 170, item.y);
          
          // Add invisible link over the TOC item
          doc.link(50, item.y - 5, 120, 5, {
            page: pageNumber,
            top: 20
          });
        }
      });

      // Add footer to each page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, 195, 285, { align: 'right' });
      }
      
      // Save the PDF
      doc.save(`Code_Analysis_Report_${submission_id}.pdf`);

      setGeneratingPDF(false);
      setPdfGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setFeedbackError('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };


  // Render file naming section with edit/delete functionality
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
                <FaCheck className="w-5 h-5" />
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Files with naming issues:
                  </h3>
                  <Badge color="gray" className="px-3 py-1">
                    Total: {fileNamingResults.invalid_files.length}
                  </Badge>
                </div>
                <div className="p-4 overflow-y-auto border border-gray-200 rounded-lg shadow-sm max-h-96 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <Table hoverable className="min-w-full">
                    <Table.Head>
                      <Table.HeadCell>File Name</Table.HeadCell>
                      <Table.HeadCell>Path</Table.HeadCell>
                      <Table.HeadCell>Issue</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {fileNamingResults.invalid_files.map((file, index) => (
                        <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {file.file_name}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {file.path}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {file.reason}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
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
            Last analyzed: {new Date(fileNamingResults.analyzed_at).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  // Render code naming section with edit/delete functionality
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
                <FaCheck className="w-5 h-5" />
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Code elements with naming issues:
                  </h3>
                  <Badge color="gray" className="px-3 py-1">
                    Total: {codeNamingResults.issues.length}
                  </Badge>
                </div>
                <div className="p-4 overflow-y-auto border border-gray-200 rounded-lg shadow-sm max-h-96 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <Table hoverable className="min-w-full">
                    <Table.Head>
                      <Table.HeadCell>Element</Table.HeadCell>
                      <Table.HeadCell>Type</Table.HeadCell>
                      <Table.HeadCell>File</Table.HeadCell>
                      <Table.HeadCell>Line</Table.HeadCell>
                      <Table.HeadCell>Issue</Table.HeadCell>
                      <Table.HeadCell>Suggested</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {codeNamingResults.issues.map((issue, index) => (
                        <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell className="font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {issue.element_name}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.element_type}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.file_path}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.line_number}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.reason}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.suggested_name}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
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
            Last analyzed: {new Date(codeNamingResults.analyzed_at).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  // Render comments accuracy section with edit/delete functionality
  const renderCommentsAccuracySection = () => {
    if (!commentsAccuracyResults || Object.keys(commentsAccuracyResults).length === 0) {
      return <p className="text-gray-600 dark:text-gray-400">No comments accuracy analysis results available.</p>;
    }
  
    return (
      <div className="space-y-4">
        {commentsAccuracyResults.status === "Pass" ? (
          <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-900">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-600 bg-green-100 rounded-full dark:bg-green-800 dark:text-green-200">
                <FaCheck className="w-5 h-5" />
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
  
            {commentsAccuracyResults.issues && commentsAccuracyResults.issues.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Comments with accuracy issues:
                  </h3>
                  <Badge color="gray" className="px-3 py-1">
                    Total: {commentsAccuracyResults.issues.length}
                  </Badge>
                </div>
                <div className="p-4 overflow-y-auto border border-gray-200 rounded-lg shadow-sm max-h-96 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <Table hoverable className="min-w-full">
                    <Table.Head>
                      <Table.HeadCell>File</Table.HeadCell>
                      <Table.HeadCell>Line</Table.HeadCell>
                      <Table.HeadCell>Type</Table.HeadCell>
                      <Table.HeadCell>Current Comment</Table.HeadCell>
                      <Table.HeadCell>Issue</Table.HeadCell>
                      <Table.HeadCell>Suggestion</Table.HeadCell>
                    </Table.Head>
                    <Table.Body className="divide-y">
                      {commentsAccuracyResults.issues.map((issue, index) => (
                        <Table.Row key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.file_path}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.line_number}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.comment_type}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            <div className="max-w-xs overflow-hidden truncate" title={issue.actual_comment}>
                              {issue.actual_comment}
                            </div>
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            {issue.issue}
                          </Table.Cell>
                          <Table.Cell className="text-gray-600 dark:text-gray-300">
                            <div className="max-w-xs overflow-hidden truncate" title={issue.suggestion}>
                              {issue.suggestion}
                            </div>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}

        {commentsAccuracyResults.analyzed_at && (
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Last analyzed: {new Date(commentsAccuracyResults.analyzed_at).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  // Render evaluator comments section with edit/delete functionality
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h5 className="font-semibold text-gray-900 dark:text-white">{filename}</h5>
              </div>
              <Badge color="gray" className="px-3 py-1">
                {Object.keys(lineComments).length} {Object.keys(lineComments).length === 1 ? 'line' : 'lines'}
              </Badge>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(lineComments).map(([lineNumber, comments]) => (
                <div key={`${filename}-${lineNumber}`} className="p-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 mr-3 text-xs font-medium text-white bg-blue-600 rounded-full dark:bg-blue-500">
                        {lineNumber}
                      </div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Line {lineNumber}</p>
                    </div>
                  </div>
                  
                  <div className="pl-9">
                    <ul className="space-y-2">
                      {comments.map((comment, index) => (
                        <li key={index} className="flex group">
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

  const renderMarkingSchemeSection = () => {
  if (marksError) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-900">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-600 bg-red-100 rounded-full dark:bg-red-800 dark:text-red-200">
            <FaTimes className="w-5 h-5" />
          </span>
          <div>
            <p className="font-medium text-red-700 dark:text-red-200">Error loading marking scheme</p>
            <p className="text-sm text-red-600 dark:text-red-300">{marksError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!markingScheme) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner size="lg" />
        <p className="mt-4">Loading marking scheme...</p>
      </div>
    );
  }

  // Extract code criteria from the marking scheme
  const codeCriteria = markingScheme.marking_schemes?.[0]?.criteria?.code || [];

  return (
    <div className="space-y-6">
      <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h5 className="font-semibold text-gray-900 dark:text-white">Marking Scheme: {markingScheme.marking_schemes[0].title}</h5>
        </div>
        
        <div className="p-5">
          {marksSuccess && (
            <div className="p-4 mb-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-600 bg-green-100 rounded-full dark:bg-green-800 dark:text-green-200">
                  <FaCheck className="w-5 h-5" />
                </span>
                <p className="font-medium text-green-700 dark:text-green-200">Marks saved successfully!</p>
              </div>
            </div>
          )}
          
          {marksError && (
            <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-900">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-600 bg-red-100 rounded-full dark:bg-red-800 dark:text-red-200">
                  <FaTimes className="w-5 h-5" />
                </span>
                <p className="font-medium text-red-700 dark:text-red-200">{marksError}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {codeCriteria.map((criterion, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{criterion.criterion}</h4>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">High:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{criterion.high_description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Medium:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{criterion.medium_description}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Low:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{criterion.low_description}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                      Weightage: {criterion.weightage}%
                    </p>
                  </div>
                  <div className="w-24 ml-4">
                    <TextInput
                      type="text"
                      min="0"
                      max="100"
                      value={marks[criterion.criterion] ?? 0}
                      contentEditable={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

  // Render final feedback section
  const renderFinalFeedbackSection = () => {
    return (
      <div className="space-y-6">

        {/* Current Saved Feedback Section */}
        {finalFeedback.trim() && !feedbackError && !submittingFeedback && (
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm dark:border-gray-700">
            <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <svg className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <h5 className="font-semibold text-gray-900 dark:text-white">Evaluator Final Feedback</h5>
            </div>
            
            <div className="p-5">
              <div className="p-4 overflow-auto whitespace-pre-wrap border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 max-h-96">
                <p className="text-gray-700 dark:text-gray-300">{finalFeedback}</p>
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
  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Spinner size="lg" />
        <p className="mt-4">Loading code analysis results...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert color="failure" className="max-w-lg">
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  // Tabs configuration
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
      title: "Marking Scheme",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      )
    },
    {
      id: 5,
      title: "Final Feedback",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      )
    }
  ];

  // Tab content renderer
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
          <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Marking Scheme Evaluation</h2>
          {renderMarkingSchemeSection()}
        </div>
      );
    case 5:
      return (
        <div id="tab-content-5">
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
          <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">Code Repository Evaluation Results</h1>
          <div className="flex items-center gap-3">
            <Button
  onClick={generatePDF}
  disabled={pdfGenerating}
  className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
>
  {pdfGenerating ? (
    <>
      <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Generating...
    </>
  ) : (
    <>
      <FaFilePdf className="w-5 h-5" />
      Generate Report
    </>
  )}
</Button>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 mr-1 bg-green-500 rounded-full"></div>
              Analysis Complete
            </div>
          </div>
        </div>

        {/* Tabs navigation */}
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
        
        {/* Tab content */}
        <div className="p-4 mt-4 bg-white rounded-lg dark:bg-gray-800">
          {tabContent()}
        </div>
      </Card>
    </div>
  );
};

export default CodeSubmissionResultsDisplay;