import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Chip,
  Divider
} from '@mui/material';
import {
  CheckCircle,
  Description,
  Schedule,
  Update
} from '@mui/icons-material';
import mammoth from 'mammoth';
import { analyzeReport } from '../../../ReportSubmit/services/aiService';
import { detectAIcontent } from '../../../ReportSubmit/services/detectAIcontent';
import { detectPlagiarism } from '../../../ReportSubmit/services/detectPlagiarism';
import { useParams } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Set PDF.js Worker
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js';
import Header from '../../../components/Header';
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const ReportUpload = ({ onSubmit }) => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const { moduleId, moduleName, userId } = location.state || {};

  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [markingScheme, setMarkingScheme] = useState(null);
  const [studentReport, setStudentReport] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [aiContentResults, setAIcontentResults] = useState(null);
  const [submitReport, setSubmitReport] = useState(null);
  const [plagiarismResults, setPlagiarismResults] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExist, setIsExist] = useState(false);

  console.log("user: ", userId)
  console.log("assign: ", assignmentId)
  // Fetch marking scheme on component mount
  useEffect(() => {
    const fetchMarkingScheme = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/marking-scheme/markingScheme/${assignmentId}`);
        const data = await response.json();
        console.log('Marking Scheme data:', data.marking_schemes[0].criteria.report);
        setMarkingScheme(data.marking_schemes[0].criteria.report);
        setActiveStep(1);
      } catch (err) {
        setError('Failed to load marking scheme.');
        console.error('Marking scheme fetch error:', err);
      }
    };

    if (assignmentId) {
      fetchMarkingScheme();
    }
  }, [assignmentId]);

  // Check for existing submission when component loads
  useEffect(() => {
    checkExistingSubmission();
  }, [assignmentId, userId]);

  const checkExistingSubmission = async () => {
    if (!assignmentId || !userId) return;

    try {
      console.log('Checking existing submission for:', { assignmentId, userId });
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/check-submission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignment_id: assignmentId, student_id: userId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Check submission result:', result);
        setIsExist(true)

        if (result.exists) {
          // Try to fetch submission details
          try {
            const submissionResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/${result.submission_id}`);
            if (submissionResponse.ok) {
              const submissionData = await submissionResponse.json();
              console.log('Submission data:', submissionData);
              setSubmissionStatus(submissionData);
              setActiveStep(3);
            } else {
              // If we can't fetch details, create a basic status
              setSubmissionStatus({
                fileName: "Student Report",
                submittedAt: new Date().toISOString(),
                mark: null,
                reportId: result.submission_id,
                status: "submitted"
              });
              setActiveStep(3);
            }
          } catch (detailError) {
            console.log('Could not fetch submission details, using basic info');
            setSubmissionStatus({
              fileName: "Student Report",
              submittedAt: new Date().toISOString(),
              mark: null,
              reportId: result.submission_id,
              status: "submitted"
            });
            setActiveStep(3);
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing submission:', error);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    console.log("Selected file:", file);

    if (!file) {
      setError('No file selected');
      return;
    }

    if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      setError('Please upload a .docx or .pdf file');
      return;
    }

    setError(null);

    try {
      const content = await parseFile(file);
      console.log('Parsed Report Content:', content);

      setStudentReport({ name: file.name, content });
      setSubmitReport({ file, content });
      setActiveStep(2);
    } catch (err) {
      setError(err.message);
      console.error('File processing error:', err);
    }
  };

  const parseFile = async (file) => {
    try {
      console.log("Received file:", file);
      const fileName = file.name.trim().toLowerCase();
      let parsedContent;

      if (fileName.endsWith('.docx')) {
        console.log("Detected DOCX file. Parsing...");
        parsedContent = await parseDocxFile(file);
      } else if (fileName.endsWith('.pdf') || file.type === "application/pdf") {
        console.log("Detected PDF file. Parsing...");
        parsedContent = await parsePdfFile(file);
      } else {
        throw new Error(`Unsupported file format: ${fileName}`);
      }

      if (!parsedContent) {
        throw new Error(`Parsed content is empty for ${fileName}`);
      }

      return parsedContent;
    } catch (error) {
      console.error("Error parsing file:", error.message);
      throw new Error(`Unable to parse document: ${error.message}`);
    }
  };

  const parseDocxFile = async (file) => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });

          if (!result.value) {
            reject(new Error('No text extracted from DOCX'));
          }

          resolve(result.value.trim());
        } catch (err) {
          console.error("Error parsing DOCX:", err);
          reject(new Error('Error parsing DOCX file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parsePdfFile = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;

          if (!pdfjsLib || !pdfjsLib.getDocument) {
            reject(new Error("PDF.js library is not available."));
            return;
          }

          // Ensure PDF.js Worker is set correctly
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;

          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }

          resolve(fullText.trim());
        } catch (err) {
          console.error("PDF parsing error:", err);
          reject(new Error("Error parsing PDF file"));
        }
      };

      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleAnalyze = async () => {
    if (!studentReport) {
      setError('Please upload the student report first');
      return;
    }
    if (!markingScheme) {
      setError('Server error to load marking report');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      console.log('Analyzing Report:', studentReport.content);

      const result = await analyzeReport(studentReport.content, markingScheme, assignmentId, (progress) => {
        setProgress(progress);
      });

      const aiContentResult = await detectAIcontent(studentReport.content, (progress) => {
        setProgress(progress);
      });

      const plagiarismResult = await detectPlagiarism(studentReport.content, (progress) => {
        console.log(`Progress: ${progress.toFixed(2)}%`);
      });

      const plagiarismPercentage = plagiarismResult.toFixed(2);
      const fakeResult = aiContentResult.find(item => item.label === 'Fake');

      if (!fakeResult) {
        setError('No AI content score found in the analysis result.');
        return;
      }

      const aiScore = (fakeResult.score * 100).toFixed(2);

      // Set all the results first
      setAnalysisResults(result);
      setAIcontentResults({ percentage: aiScore });
      setPlagiarismResults(plagiarismPercentage);
      setActiveStep(3);

      console.log("✅ Calling handleSubmitAssignment...");

      // Submit the assignment with all the analysis results
      await handleSubmitAssignmentWithResults(result, { percentage: aiScore }, plagiarismPercentage);

      if (onSubmit) {
        await onSubmit(result);
      }

    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignmentWithResults = async (analysisResults, aiContentResults, plagiarismResults) => {
    console.log("Submitting with file:", submitReport.file);

    const submissionData = {
      moduleCode: moduleId,
      status: "submitted",
      submissionReport: submitReport.file,
      analysisReport: analysisResults,
      aiContent: aiContentResults,
      plagiarism: plagiarismResults,
      studentId: userId,
      mark: analysisResults.totalScore,
      markingReference: assignmentId,
      summary: studentReport.content,
      fileName: studentReport.name, // Add file name
      submittedAt: new Date().toISOString(), // Add timestamp
    };

    try {
      const reportResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/report/report-submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!reportResponse.ok) {
        throw new Error("Failed to submit the assignment report.");
      }

      const reportResult = await reportResponse.json();
      const reportId = reportResult.report.report_id;
      setReportID(reportId)

      // Check if submission exists
      const checkResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/check-submission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignment_id: assignmentId, student_id: userId }),
      });

      if (!checkResponse.ok) {
        throw new Error("Failed to check submission existence.");
      }

      const checkResult = await checkResponse.json();

      if (checkResult.exists) {
        // Update existing submission
        const updateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/update-report`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ submission_id: checkResult.submission_id, report_id: reportId }),
        });

        if (!updateResponse.ok) {
          throw new Error("Failed to update report ID.");
        }
      } else {
        // Create new submission
        const createResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignment_id: assignmentId,
            student_id: userId,
            report_id: reportId,
            code_id: null,
            video_id: null,
          }),
        });

        if (!createResponse.ok) {
          throw new Error("Failed to create a new submission.");
        }
      }

      // Update submission status with the new data
      const newSubmissionStatus = {
        fileName: studentReport.name,
        submittedAt: new Date().toISOString(),
        mark: analysisResults.totalScore,
        reportId: reportId,
        status: "submitted"
      };

      setSubmissionStatus(newSubmissionStatus);
      setIsUpdating(false);
      setProgress(100);
      alert("Assignment submitted successfully!");

    } catch (error) {
      console.error('Submission error:', error);
      throw error;
    }
  };

  const formatSubmissionTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleUpdateSubmission = () => {
    console.log('Update submission clicked');
    setIsUpdating(true);
    setActiveStep(1);
    setStudentReport(null);
    setSubmitReport(null);
  };

  const handleCancelUpdate = () => {
    setIsUpdating(false);
    setStudentReport(null);
    setSubmitReport(null);
    setActiveStep(3);
  };

const handleDownloadPdf = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let yPosition = margin;

  // Helper function to add page break if needed
  const checkPageBreak = (neededHeight) => {
    if (yPosition + neededHeight > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add text with word wrapping
  const addWrappedText = (text, x, y, maxWidth, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.4);
  };

  // Header
  doc.setFillColor(25, 118, 210); // Primary blue color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('Analysis Report', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, 35);

  yPosition = 60;

  // AI Content and Plagiarism Summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', margin, yPosition);
  yPosition += 15;

  // Create summary boxes
  const boxWidth = (pageWidth - margin * 3) / 2;
  const boxHeight = 40;

  // AI Content Box
  doc.setFillColor(227, 242, 253); // Light blue
  doc.rect(margin, yPosition, boxWidth, boxHeight, 'F');
  doc.setDrawColor(25, 118, 210);
  doc.setLineWidth(1);
  doc.rect(margin, yPosition, boxWidth, boxHeight, 'S');

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(25, 118, 210);
  doc.text(`${reportData?.aiContent?.percentage || "0"}%`, margin + 10, yPosition + 15);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  doc.text('of this report appears to be', margin + 10, yPosition + 25);
  doc.text('AI-generated', margin + 10, yPosition + 32);

  // Plagiarism Box
  doc.setFillColor(227, 242, 253); // Light blue
  doc.rect(margin * 2 + boxWidth, yPosition, boxWidth, boxHeight, 'F');
  doc.setDrawColor(25, 118, 210);
  doc.rect(margin * 2 + boxWidth, yPosition, boxWidth, boxHeight, 'S');

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(25, 118, 210);
  doc.text(`${reportData?.plagiarism || "0"}%`, margin * 2 + boxWidth + 10, yPosition + 15);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');
  doc.text('Found significant plagiarism', margin * 2 + boxWidth + 10, yPosition + 25);
  doc.text('in your report', margin * 2 + boxWidth + 10, yPosition + 32);

  yPosition += boxHeight + 20;

  // Total Score Section
  if (reportData?.analysis_report?.totalScore) {
    checkPageBreak(30);
    
    doc.setFillColor(227, 242, 253);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 25, 'F');
    doc.setDrawColor(25, 118, 210);
    doc.rect(margin, yPosition, pageWidth - margin * 2, 25, 'S');

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text(`Total Score: ${reportData.analysis_report.totalScore}/100`, margin + 10, yPosition + 15);

    yPosition += 40;
  }

  // Detailed Analysis Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Detailed Analysis', margin, yPosition);
  yPosition += 15;

  // Criteria Analysis
  if (reportData?.analysis_report?.criteria) {
    reportData.analysis_report.criteria.forEach((criterion, index) => {
      const estimatedHeight = 80; // Estimated height for each criterion
      checkPageBreak(estimatedHeight);

      // Criterion header
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPosition, pageWidth - margin * 2, 20, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, yPosition, pageWidth - margin * 2, 20, 'S');

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(criterion.description, margin + 5, yPosition + 12);

      // Score
      const scoreText = `${criterion.awarded}/${(criterion.weightage * 20) / 100} marks`;
      const scoreWidth = doc.getTextWidth(scoreText);
      doc.setTextColor(25, 118, 210);
      doc.text(scoreText, pageWidth - margin - scoreWidth - 5, yPosition + 12);

      yPosition += 25;

      // Weightage
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Weightage:', margin + 5, yPosition);
      doc.setFont(undefined, 'normal');
      doc.text(`${criterion.weightage}%`, margin + 35, yPosition);

      yPosition += 10;

      // Justification
      doc.setFont(undefined, 'bold');
      doc.text('Justification:', margin + 5, yPosition);
      yPosition += 5;
      
      doc.setFont(undefined, 'normal');
      yPosition = addWrappedText(
        criterion.justification, 
        margin + 5, 
        yPosition, 
        pageWidth - margin * 2 - 10, 
        9
      );

      yPosition += 5;

      // Suggestions
      if (criterion.suggestions && criterion.suggestions.length > 0) {
        doc.setFont(undefined, 'bold');
        doc.text('Suggestions for improvement:', margin + 5, yPosition);
        yPosition += 8;

        criterion.suggestions.forEach((suggestion, idx) => {
          checkPageBreak(15);
          doc.setFont(undefined, 'normal');
          doc.text(`• ${suggestion}`, margin + 10, yPosition);
          yPosition = addWrappedText(
            suggestion, 
            margin + 15, 
            yPosition, 
            pageWidth - margin * 2 - 20, 
            9
          );
          yPosition += 3;
        });
      }

      yPosition += 10;
    });
  }

  // General Feedback Section
  if (reportData?.analysis_report?.feedback) {
    checkPageBreak(50);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('General Feedback', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    yPosition = addWrappedText(
      reportData.analysis_report.feedback,
      margin,
      yPosition,
      pageWidth - margin * 2,
      10
    );
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - 10
    );
    doc.text(
      'Generated by Analysis System',
      margin,
      pageHeight - 10
    );
  }

  // Save the PDF
  const fileName = `Analysis_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};



  const [reportSubmissions, setReportSubmissions] = useState([]);
  const [reportID, setReportID] = useState('');
  const [submissionID, setSubmissionID] = useState('');
  const [reportData, setReportData] = useState('');
  const [assignmentData, setAssignmentData] = useState('');


  // Fetch user email
  const fetchUserEmail = async (uid) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${uid}`,
      );
      const data = await response.json();
      if (response.ok) {
        return data.email;
      } else {
        throw new Error(data.error || "Failed to fetch user.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Fetch assignment details
  const fetchAssignmentDetails = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/submission/getSubmissionsByAssignment/${assignmentId}`
    );
    const data = await response.json();

    // Replace this with how you get the current user's ID
    const currentUserId = userId;

    // Find the first submission belonging to the current student
    const matchingSubmission = data.submissions.find(
      (submission) => submission.student_id === currentUserId
    );

    if (response.ok && matchingSubmission) {
      setSubmissionID(matchingSubmission.submission_id);
      setReportID(matchingSubmission.report_id);
      console.log("Matched report ID:", matchingSubmission.report_id);
    } else {
      console.warn("No matching submission found for this student.");
    }
  } catch (error) {
    console.error("Error fetching assignment details:", error);
  }
};



  useEffect(() => {
    const fetchAllReportSubmissions = async () => {
      try {

        setError(null);
        setLoading(true);

        await fetchAssignmentDetails();

        console.log('Fetching report submissions for assignment ID:', reportID);
        console.log("hellow ")
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/report/report-submissions/${reportID}`);

        console.log("response: ", response);
        const Reportdata = await response.json();
        console.log("report", Reportdata.student_id);


        if (response.ok) {
          if (Reportdata.student_id === userId) {
            console.log("user have existing submission", Reportdata);
            setReportData(Reportdata);
          }


          // Set the individual state variables based on the response structure
          // setAiContentResults(Reportdata.aiContent || {});
          setPlagiarismResults(Reportdata.plagiarism || "0");
          setAnalysisResults(Reportdata.analysis_report || {});
        }


        const AssignmentResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`);

        console.log("AssignmentResponse: ", AssignmentResponse);
        const assignmentData = await AssignmentResponse.json();
        if (AssignmentResponse.ok) {
          setAssignmentData(assignmentData);
          console.log("assignment", assignmentData);
        }

      } catch (err) {
        console.error("Fetch error:", err);
        // setError("Failed to fetch report submissions");
      } finally {
        setLoading(false);
      }
    };

    if (assignmentId) {
      fetchAllReportSubmissions();
    }
  }, [assignmentId, reportID]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      submitted: { color: "warning", label: "Submitted" },
      reviewed: { color: "info", label: "Reviewed" },
      published: { color: "success", label: "Published" }
    };

    const config = statusConfig[status] || { color: "default", label: status || 'Unknown' };

    return (
      <Chip
        label={config.label}
        color={config.color}
        variant="filled"
        size="small"
      />
    );
  };

  console.log("iii", reportID)
  return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>

      <Box sx={{ mt: 12, maxWidth: 800, mx: 'auto' }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {['Marking Scheme Loaded', 'Upload Student Report', 'Analysis', 'Result'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Show submission status card if submission exists and not updating */}
        {reportData && !isUpdating && (
          <Card sx={{ mb: 4, border: '2px solid #4caf50' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ color: '#4caf50', mr: 2, fontSize: 32 }} />
                <Box>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Assignment Submitted Successfully
                  </Typography>
                  <Chip
                    label="SUBMITTED"
                    color="success"
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'space-between' }}>

                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <Description sx={{ color: '#666', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Assignment:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignmentData.name}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule sx={{ color: '#666', mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Deadline:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {assignmentData.deadline}
                    </Typography>
                  </Box>
                </Box>

                {/* {submissionStatus.mark && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                    Score:
                  </Typography>
                  <Chip 
                    label={`${submissionStatus.mark}/100`}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )} */}
              </Box>

              {reportData.status != 'published' && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Update />}
                    onClick={handleUpdateSubmission}
                  >
                    Update Submission
                  </Button>

                  {/* <Button
                variant="contained"
                color="primary"
                onClick={handleDownloadPdf}
              >
                Download Analysis Report
              </Button> */}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload section - show when no submission or updating */}
        {(!reportData || isUpdating) && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {isUpdating ? 'Update Student Report' : 'Upload Student Report'}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept=".docx,.pdf"
                onChange={(e) => {
                  handleFileChange(e);
                  e.target.value = null;
                }}
                style={{ display: 'none' }}
                id="student-report-upload"
              />

              <label htmlFor="student-report-upload">
                <Button
                  variant="contained"
                  component="span"
                  disabled={loading}
                  sx={{ mr: 2 }}
                >
                  {studentReport ? 'Change Student Report' :
                    isUpdating ? 'Upload New Report' : 'Upload Student Report'}
                </Button>
              </label>

              {studentReport && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Selected: {studentReport.name}
                </Typography>
              )}
            </Box>

            {studentReport && !loading && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAnalyze}
                  sx={{ mt: 2 }}
                >
                  {isUpdating ? 'Update & Analyze Report' : 'Analyze and Submit Report'}
                </Button>

                {isUpdating && (
                  <Button
                    variant="outlined"
                    onClick={handleCancelUpdate}
                    sx={{ mt: 2 }}
                  >
                    Cancel Update
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}



        {/* analysis Results published reports */}
        {reportData.status === 'published' && (
          <div>
            <div className='flex gap-x-4'>
              <Box sx={{ mt: 4 }} className='border-2 p-[1.5rem] rounded-md border-[#1976d22b] w-1/2 mt-8'>
                <Typography variant="h5" color="primary">
                  {reportData?.aiContent?.percentage || "0"}%
                </Typography>
                {reportData?.aiContent?.percentage !== undefined ? (
                  <Typography variant="h8" gutterBottom>
                    of this report appears to be AI-generated
                  </Typography>
                ) : (
                  <Typography variant="body1" color="error">
                    Unable to calculate AI content percentage.
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 4 }} className='border-2 p-[1.5rem] rounded-md border-[#1976d22b] w-1/2 mt-8'>
                <Typography variant="h5" color="primary">
                  {reportData?.plagiarism || "0"}%
                </Typography>
                {reportData?.plagiarism !== undefined ? (
                  <Typography variant="h8" gutterBottom>
                    Found significant plagiarism in your report
                  </Typography>
                ) : (
                  <Typography variant="body1" color="error">
                    Unable to calculate plagiarism percentage.
                  </Typography>
                )}
              </Box>
            </div>

            <Box sx={{ mt: 4, p: 3, border: '1px solid #ccc', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>

              {/* Display Total Score */}
              {reportData?.analysis_report?.totalScore && (
                <Box sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                  <Typography variant="h6" color="primary">
                    Total Score: {reportData.analysis_report.totalScore}/100
                  </Typography>
                </Box>
              )}

              {/* Display Criteria */}
              {reportData?.analysis_report?.criteria?.map((criterion, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <div className="flex items-start justify-between mb-2">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {criterion.description}
                    </Typography>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">
                      {criterion.awarded}/{(criterion.weightage * 20) / 100} marks
                    </Typography>
                  </div>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Weightage:</strong> {criterion.weightage}%
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Justification:</strong> {criterion.justification}
                  </Typography>

                  {criterion.suggestions?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        Suggestions for improvement:
                      </Typography>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {criterion.suggestions.map((suggestion, idx) => (
                          <li key={idx}>
                            <Typography variant="body2" color="text.secondary">
                              {suggestion}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  )}
                </Box>
              ))}

              {/* Display General Feedback */}
              {reportData?.analysis_report?.feedback && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    General Feedback
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {reportData.analysis_report.feedback}
                  </Typography>

                  {/* Display Summary if available */}
                  {/* {reportData?.summary && (
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Report Summary:
              </Typography>
              <Typography variant="body2">
                {reportData.summary}
              </Typography>
            </Box>
          )} */}

                  <div className='flex gap-6'>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDownloadPdf}
                      sx={{ mt: 2 }}
                    >
                      Download Analysis as PDF
                    </Button>
                  </div>
                </Box>
              )}
            </Box>
          </div>


        )}

        {/* Loading and Error states */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {progress === 0 ? 'Processing files...' :
                progress === 50 ? 'Analyzing content...' :
                  isUpdating ? 'Updating submission...' : 'Completing analysis...'}
            </Typography>
            <CircularProgress size={24} sx={{ mt: 1 }} />
          </Box>
        )}
      </Box>
    </div>
  );
};

export default ReportUpload;