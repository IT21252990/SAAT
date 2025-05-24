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

  // Fetch marking scheme on component mount
  useEffect(() => {
    const fetchMarkingScheme = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/v1/marking-scheme/markingScheme/${assignmentId}`);
        const data = await response.json();
        console.log('Marking Scheme data:', data);
        setMarkingScheme(data);
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
      
      const response = await fetch("http://127.0.0.1:5000/api/v1/submission/check-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignment_id: assignmentId, student_id: userId }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Check submission result:', result);
        
        if (result.exists) {
          // Try to fetch submission details
          try {
            const submissionResponse = await fetch(`http://127.0.0.1:5000/api/v1/submission/${result.submission_id}`);
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
      
      const result = await analyzeReport(studentReport.content, markingScheme.criteria, assignmentId, (progress) => {
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

      const aiScore = (fakeResult.score * 100000).toFixed(2);
      
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
      const reportResponse = await fetch("http://127.0.0.1:5000/api/v1/report/report-submissions", {
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

      // Check if submission exists
      const checkResponse = await fetch("http://127.0.0.1:5000/api/v1/submission/check-submission", {
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
        const updateResponse = await fetch("http://127.0.0.1:5000/api/v1/submission/update-report", {
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
        const createResponse = await fetch("http://127.0.0.1:5000/api/v1/submission/create", {
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
    doc.setFont("helvetica");
    let yPosition = 20;

    // Title
    doc.setFontSize(16);
    doc.setTextColor(25, 118, 210);
    doc.text("Analysis Results", 14, yPosition);
    yPosition += 10;

    // Function to create styled boxes
    const createResultBox = (title, percentage) => {
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(0.5);
      doc.rect(10, yPosition, 90, 30);

      doc.setFontSize(14);
      doc.setTextColor(25, 118, 210);
      doc.text(`${percentage}%`, 14, yPosition + 10);

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(title, 14, yPosition + 20);

      yPosition += 40;
    };

    if (aiContentResults) {
      createResultBox("of this report appears to be AI-generated", aiContentResults.percentage || "N/A");
    }
    if (plagiarismResults !== undefined) {
      createResultBox("Found significant plagiarism in your report", plagiarismResults || "N/A");
    }

    // Add more content to PDF as needed...
    doc.save("analysis_results.pdf");
  };

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
      {submissionStatus && !isUpdating && (
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Description sx={{ color: '#666', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Submitted File:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {submissionStatus.fileName || 'Student Report'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ color: '#666', mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Submission Time:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatSubmissionTime(submissionStatus.submittedAt || submissionStatus.createdAt)}
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
          </CardContent>
        </Card>
      )}

      {/* Upload section - show when no submission or updating */}
      {(!submissionStatus || isUpdating) && (
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
                {isUpdating ? 'Update & Analyze Report' : 'Analyze Report'}
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