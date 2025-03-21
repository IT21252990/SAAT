// import React, { useState, useEffect } from 'react';
// import { Box, Button, CircularProgress, Alert, Typography, Stepper, Step, StepLabel } from '@mui/material';
// import mammoth from 'mammoth';
// import { analyzeReport } from '../../../ReportSubmit/services/aiService';
// import { detectAIcontent } from '../../../ReportSubmit/services/detectAIcontent';
// import { detectPlagiarism } from '../../../ReportSubmit/services/detectPlagiarism';
// import { useParams } from 'react-router-dom';
// import { useLocation } from "react-router-dom";

// import { jsPDF } from "jspdf";

// import * as pdfjsLib from 'pdfjs-dist/build/pdf';  // ✅ Correct PDF.js import

// // Ensure PDF.js Worker is set

// import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js';
// pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// // const pdfWorker = await import('pdfjs-dist/build/pdf.worker.mjs');

// // ✅ Properly Set the PDF.js Worker
// // pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// // ✅ If Dynamic Import is Needed, Use This Inside an Async Function
// // const loadPdfWorker = async () => {
// //   const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
// //   console.log("✅ PDF Worker Loaded:", pdfjsWorker);
// // };


// const ReportUpload = ({ onSubmit }) => {
//   const { assignmentId } = useParams();  // Get schemaId from the URL
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [markingScheme, setMarkingScheme] = useState(null);
//   const [studentReport, setStudentReport] = useState(null);
//   const [activeStep, setActiveStep] = useState(0);
//   const [progress, setProgress] = useState(0);
//   const [analysisResults, setAnalysisResults] = useState(null);
//   const [aiContentResults, setAIcontentResults] = useState(null);
//   const [submitReport, setSubmitReport] = useState(null);
//   const [plagiarismResults, setPlagiarismResults] = useState(null);
//   const location = useLocation();
//   // Destructure the passed state
//   const { moduleId, moduleName, userId } = location.state || {};

//   // Fetch marking scheme from the API based on schemaId
//   useEffect(() => {

//     const fetchMarkingScheme = async () => {
//       try {
//         // setLoading(true);
//         const response = await fetch(`http://127.0.0.1:5000/api/v1/marking-scheme/markingScheme/${assignmentId}`);
//         const data = await response.json();
//         console.log('Marking Scheme dataa:', data); // Add this for debugging
//         setMarkingScheme(data);
//         setActiveStep(1); // Move to the next step
//       } catch (err) {
//         setError('Failed to load marking scheme.');
//         console.error('Marking scheme fetch error:', err);
//       } finally {
//         // setLoading(false);
//       }
//     };

//     console.log("hi", assignmentId)
//     if (assignmentId) {
//       fetchMarkingScheme();
//     }
//   }, [assignmentId]);

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0];
//     console.log("Selected file:", file);  // Debugging log

//     if (!file) {
//       setError('No file selected');
//       console.log('No file selected')
//       return;
//     }

//     if (!file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
//       setError('Please upload a .docx or .pdf file');
//       console.log('Please upload a .docx or .pdf file');
//       return;
//     }

//     setError(null);

//     try {
//       console.log('Parsed Report Content:', file); // Debugging log
//       const content = await parseFile(file);
//       console.log('Parsed Report Content:', content); // Debugging log

//       // Store both the file object and its parsed content
//       setStudentReport({ name: file.name, content });
//       setSubmitReport({ file, content });

//       setActiveStep(2);  // Move to next step after upload

//     } catch (err) {
//       setError(err.message);
//       console.error('File processing error:', err);
//     }
//   };


//   // console.log('Report pdf:', submitReport.file);

//   const parseFile = async (file) => {
//     console.log("ji")
//     try {
//       console.log("Received file:", file);
//       console.log(`File name: "${file.name}", Type: "${file.type}", Size: ${file.size} bytes`);

//       let parsedContent;

//       // Convert file name to lowercase to avoid case sensitivity issues
//       const fileName = file.name.trim().toLowerCase();

//       if (fileName.endsWith('.docx')) {
//         console.log("Detected DOCX file. Parsing...");
//         parsedContent = await parseDocxFile(file);
//       } else if (fileName.endsWith('.pdf') || file.type === "application/pdf") {
//         console.log("Detected PDF file. Parsing...");
//         parsedContent = await parsePdfFile(file);
//         console.log("Parsing completed for:", fileName);
//       } else {
//         throw new Error(`Unsupported file format: ${fileName}`);
//       }

//       if (!parsedContent) {
//         throw new Error(`Parsed content is empty for ${fileName}`);
//       }

//       console.log("Successfully parsed content:", parsedContent);
//       return parsedContent;
//     } catch (error) {
//       console.error("Error parsing file:", error.message);
//       throw new Error(`Unable to parse document: ${error.message}`);
//     }
//   };




//   const parseDocxFile = async (file) => {
//     const reader = new FileReader();
//     return new Promise((resolve, reject) => {
//       reader.onload = async (event) => {
//         try {
//           const arrayBuffer = event.target.result;
//           const result = await mammoth.extractRawText({ arrayBuffer });
//           console.log("DOCX Content:", result.value);  // Log extracted text

//           if (!result.value) {
//             reject(new Error('No text extracted from DOCX'));
//           }

//           resolve(result.value.trim());
//         } catch (err) {
//           console.error("Error parsing DOCX:", err);
//           reject(new Error('Error parsing DOCX file'));
//         }
//       };
//       reader.onerror = (err) => {
//         console.error("FileReader error:", err);
//         reject(new Error('Error reading file'));
//       };
//       reader.readAsArrayBuffer(file);
//     });
//   };


//   useEffect(() => {
//     console.log("Loading state:", loading);
//   }, [loading]);


//   const parsePdfFile = async (file) => {
//     console.log("Function parsePdfFile started.");
//     const reader = new FileReader(); // Initialize FileReader

//     return new Promise((resolve, reject) => {
//       reader.onload = async (event) => {
//         try {
//           const arrayBuffer = event.target.result;
//           console.log("File read successfully. ArrayBuffer size:", arrayBuffer.byteLength);

//           // Check if pdfjsLib is available
//           if (!pdfjsLib || !pdfjsLib.getDocument) {
//             console.error("pdfjsLib is not loaded or getDocument function is undefined.");
//             reject(new Error("PDF.js library is not available."));
//             return;
//           } else {
//             console.log(pdfjsLib);
//           }

//           // Ensure PDF.js Worker is set correctly
//           pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';  // Adjust to match your version

//           // Load PDF
//           const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
//           console.log(loadingTask.promise)
//           const pdf = await loadingTask.promise;  // Wait for PDF document to be loaded
//           console.log("✅ PDF loaded successfully. Pages:", pdf.numPages);

//           let fullText = '';

//           // Extract text from all pages
//           for (let i = 1; i <= pdf.numPages; i++) {
//             const page = await pdf.getPage(i);
//             const textContent = await page.getTextContent();
//             const pageText = textContent.items.map(item => item.str).join(' '); // Join text items on the page
//             fullText += pageText + '\n';
//           }

//           console.log("Extracted Text:", fullText);
//           resolve(fullText.trim());  // Resolve with extracted text

//         } catch (err) {
//           console.error("❌ PDF parsing error:", err);
//           reject(new Error("Error parsing PDF file"));
//         }
//       };

//       // Handle file reader errors
//       reader.onerror = () => reject(new Error("Error reading file"));
//       reader.readAsArrayBuffer(file);  // Start reading the file as an ArrayBuffer
//     });
//   };



//   const handleAnalyze = async () => {
//     if (!studentReport) {
//       setError('Please upload the student report first');
//       return;
//     }
//     if (!markingScheme) {
//       setError('Server error to load marking report');
//       return;
//     }

//     // console.log("meka ", markingScheme.marking_schemes[0].criteria)
//     setLoading(true);
//     setError(null);
//     setProgress(0);

//     try {
//       // Check that markingScheme.content and studentReport.content are available
//       console.log('Analyzing Report:', studentReport.content);
//       console.log(progress)
//       console.log("id is", studentReport.content, markingScheme.marking_schemes[0].criteria, assignmentId,)
//       const result = await analyzeReport(studentReport.content, markingScheme.criteria, assignmentId, (progress) => {
//         setProgress(progress);
//       });

//       const aiContentResult = await detectAIcontent(studentReport.content, (progress) => {
//         setProgress(progress);
//       });

//       const plagiarismResult = await detectPlagiarism(studentReport.content, (progress) => {
//         console.log(`Progress: ${progress.toFixed(2)}%`);
//       });
//       const plagiarismPercentage = plagiarismResult.toFixed(2);
//       console.log(`Final Plagiarism Score: ${plagiarismPercentage}%`);

//       console.log('Analysis Result:', result);
//       console.log('AI content Result:', aiContentResult);

//       const fakeResult = aiContentResult.find(item => item.label === 'Fake');

//       if (fakeResult ) {
//         const aiScore = (fakeResult.score * 100000).toFixed(2); // Convert to percentage and round
//         setAIcontentResults({ percentage: aiScore });
//         setPlagiarismResults(plagiarismPercentage);
//       } else {
//         setError('No AI content score found in the analysis result.');
//       }

//       setAnalysisResults(result);
//       setActiveStep(3);

//       if (onSubmit) {
//         await onSubmit(result);
//       }
//     } catch (err) {
//       console.error('Analysis error:', err);
//       setError(err.message || 'Failed to analyze report. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     console.log("Student Report Updated:", studentReport);
//   }, [studentReport]);


//   const handleDownloadPdf = () => {
//     const doc = new jsPDF();
//     doc.setFont("helvetica");
  
//     let yPosition = 20; // Initial vertical position
  
//     // Title
//     doc.setFontSize(16);
//     doc.setTextColor(25, 118, 210);
//     doc.text("Analysis Results", 14, yPosition);
//     yPosition += 10; // Add spacing
  
//     // Function to create styled boxes
//     const createResultBox = (title, percentage) => {
//       doc.setDrawColor(25, 118, 210);
//       doc.setLineWidth(0.5);
//       doc.rect(10, yPosition, 90, 30); // Box outline
  
//       doc.setFontSize(14);
//       doc.setTextColor(25, 118, 210);
//       doc.text(`${percentage}%`, 14, yPosition + 10);
  
//       doc.setFontSize(10);
//       doc.setTextColor(0, 0, 0);
//       doc.text(title, 14, yPosition + 20);
  
//       yPosition += 40; // Increase y-position for next section
//     };
  
//     if (aiContentResults) {
//       createResultBox("of this report appears to be AI-generated", aiContentResults.percentage || "N/A");
//     }
//     if (plagiarismResults !== undefined) {
//       createResultBox("Found significant plagiarism in your report", plagiarismResults || "N/A");
//     }
  
//     // Overall Score
//     if (analysisResults) {
//       doc.setFontSize(14);
//       doc.setTextColor(25, 118, 210);
//       doc.text(`Overall Score: ${analysisResults.totalScore || 0}%`, 14, yPosition);
//       yPosition += 10;
  
//       // Analysis Criteria - Creating individual boxes
//       analysisResults.criteria?.forEach((criterion, index) => {
//         doc.setDrawColor(200, 200, 200);
//         doc.rect(10, yPosition, 190, 50); // Increase box height to avoid overlapping
  
//         doc.setFontSize(12);
//         doc.setTextColor(0, 0, 0);
//         doc.text(`Criterion: ${criterion.description}`, 14, yPosition + 10);
//         doc.text(`Score: ${criterion.awarded} / ${criterion.weightage}`, 14, yPosition + 20);
  
//         // Wrap long justification text
//         const justificationText = doc.splitTextToSize(`Justification: ${criterion.justification}`, 180);
//         doc.text(justificationText, 14, yPosition + 30);
  
//         yPosition += 50 + (justificationText.length * 5); // Adjust yPosition dynamically
  
//         // Suggestions (if available)
//         if (criterion.suggestions?.length > 0) {
//           doc.setFontSize(10);
//           doc.text("Suggestions:", 14, yPosition);
//           yPosition += 5;
  
//           criterion.suggestions.forEach((suggestion, idx) => {
//             const wrappedSuggestion = doc.splitTextToSize(`- ${suggestion}`, 180);
//             doc.text(wrappedSuggestion, 14, yPosition);
//             yPosition += wrappedSuggestion.length * 5;
//           });
//         }
  
//         yPosition += 10; // Add extra space before next criterion
//       });
  
//       // General Feedback Section
//       if (analysisResults.feedback) {
//         doc.setFontSize(12);
//         doc.setTextColor(25, 118, 210);
//         doc.text("General Feedback", 14, yPosition);
//         yPosition += 10;
  
//         doc.setFontSize(10);
//         doc.setTextColor(0, 0, 0);
//         const wrappedFeedback = doc.splitTextToSize(analysisResults.feedback, 180);
//         doc.text(wrappedFeedback, 14, yPosition);
//       }
//     }
  
//     // Save the PDF
//     doc.save("analysis_results.pdf");
//   };
  
  


//   const handleSubmitAssignment = async () => {
//     setLoading(true);
//     setError(null);

//     console.log(submitReport.file)
//     const submissionData = {
//       moduleCode: moduleId,
//       status: "submitted",
//       submissionReport: submitReport.file,
//       analysisReport: analysisResults,
//       aiContent: aiContentResults,
//       plagiarism: plagiarismResults,
//       studentId: userId,
//       mark: analysisResults.totalScore,
//       markingReference: assignmentId,
//       summary: studentReport.content,
//     };

//     try {
//       // Submit report
//       const reportResponse = await fetch("http://127.0.0.1:5000/api/v1/report/report-submissions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(submissionData),
//       });

//       console.log(submissionData)
//       if (!reportResponse.ok) {
//         throw new Error("Failed to submit the assignment report.");
//       }
//       // Get the newly created report ID
//       const reportResult = await reportResponse.json();
//       console.log("reportResult: ", reportResult.report.report_id)
//       const reportId = reportResult.report.report_id; // Ensure API response includes this

//       // Check if submission exists
//       const checkResponse = await fetch("http://127.0.0.1:5000/api/v1/submission/check-submission", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ assignment_id: assignmentId, student_id: userId }),
//       });

//       if (!checkResponse.ok) {
//         throw new Error("Failed to check submission existence.");
//       }

//       const checkResult = await checkResponse.json();

//       if (checkResult.exists) {
//         // If submission exists, update report ID
//         const updateResponse = await fetch("http://127.0.0.1:5000/api/v1/submission/update-report", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ submission_id: checkResult.submission_id, report_id: reportId }),
//         });

//         if (!updateResponse.ok) {
//           throw new Error("Failed to update report ID.");
//         }
//       } else {
//         // If submission does not exist, create a new one
//         const createResponse = await fetch("http://127.0.0.1:5000/api/v1/submission/create", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             assignment_id: assignmentId,
//             student_id: userId,
//             report_id: reportId,
//             code_id: null,
//             video_id: null,
//           }),
//         });

//         if (!createResponse.ok) {
//           throw new Error("Failed to create a new submission.");
//         }
//       }

//       setProgress(100);
//       setLoading(false);
//       alert("Assignment submitted successfully!");
//       window.location.reload();
//     } catch (error) {
//       setLoading(false);
//       setError(error.message);
//     }
//   };


//   return (
//     <Box sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
//       <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
//         {['Marking Scheme Loaded', 'Upload Student Report', 'Analysis', 'Result'].map((label) => (
//           <Step key={label}>
//             <StepLabel>{label}</StepLabel>
//           </Step>
//         ))}
//       </Stepper>

//       <Box sx={{ mb: 4 }}>
//         <Typography variant="h6" gutterBottom>
//           Upload Student Report
//         </Typography>

//         <Box sx={{ mb: 3 }}>
//           <input
//             type="file"
//             accept=".docx,.pdf"
//             onChange={(e) => {
//               handleFileChange(e);
//               e.target.value = null; // Reset input to allow re-uploading same file
//             }}
//             style={{ display: 'none' }}
//             id="student-report-upload"
//           />

//           <label htmlFor="student-report-upload">
//             <Button
//               variant="contained"
//               component="span"
//               disabled={loading}
//               sx={{ mr: 2 }}
//             >
//               {studentReport ? 'Change Student Report' : 'Upload Student Report'}
//             </Button>
//           </label>
//           {studentReport && (
//             <Typography variant="body2" color="text.secondary">
//               Uploaded: {studentReport.name}
//             </Typography>
//           )}
//         </Box>

//         {studentReport && !loading && (
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={handleAnalyze}
//             sx={{ mt: 2 }}
//           >
//             Analyze Report
//           </Button>
//         )}

//         {aiContentResults && plagiarismResults && (
//           <div className='flex gap-x-4'>
//             <Box sx={{ mt: 4 }} class='border-2 p-[1.5rem] rounded-md border-[#1976d22b] w-1/2 mt-8'>
//               <Typography variant="h5" color="primary">
//                 {aiContentResults.percentage}%
//               </Typography>

//               {aiContentResults.percentage !== undefined ? (
//                 <Typography variant="h8" gutterBottom>
//                   of this report appears to be AI-generated
//                 </Typography>
//               ) : (
//                 <Typography variant="body1" color="error">
//                   Unable to calculate AI content percentage.
//                 </Typography>
//               )}
//             </Box>
//             <Box sx={{ mt: 4 }} class='border-2 p-[1.5rem] rounded-md border-[#1976d22b] w-1/2 mt-8'>
//               <Typography variant="h5" color="primary">
//                 {plagiarismResults}%
//               </Typography>

//               {plagiarismResults !== undefined ? (
//                 <Typography variant="h8" gutterBottom>
//                   Found significant plagiarism in your report
//                 </Typography>
//               ) : (
//                 <Typography variant="body1" color="error">
//                   Unable to calculate plagiarism percentage.
//                 </Typography>
//               )}
//             </Box>
//           </div>
//         )}

//         {analysisResults && (
//           <Box sx={{ mt: 4, p: 3, border: '1px solid #ccc', borderRadius: 1 }}>
//             <Typography variant="h6" gutterBottom>
//               Analysis Results
//             </Typography>
//             <Typography variant="h5" color="primary">
//               Overall Score: {analysisResults.totalScore || 0}%
//             </Typography>

//             {analysisResults.criteria?.map((criterion, index) => (
//               <Box key={index} sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
//                 <Typography variant="subtitle1" fontWeight="bold">
//                   {criterion.description}
//                 </Typography>
//                 <Typography>
//                   Score: {criterion.awarded} / {criterion.weightage} points
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//                   Justification: {criterion.justification}
//                 </Typography>
//                 {criterion.suggestions?.length > 0 && (
//                   <Box sx={{ mt: 1 }}>
//                     <Typography variant="body2" color="text.secondary">
//                       Suggestions for improvement:
//                     </Typography>
//                     <ul style={{ margin: '4px 0' }}>
//                       {criterion.suggestions.map((suggestion, idx) => (
//                         <li key={idx}>
//                           <Typography variant="body2" color="text.secondary">
//                             {suggestion}
//                           </Typography>
//                         </li>
//                       ))}
//                     </ul>
//                   </Box>
//                 )}
//               </Box>
//             ))}

//             {analysisResults.feedback && (
//               <Box sx={{ mt: 3 }}>
//                 <Typography variant="h6" gutterBottom>
//                   General Feedback
//                 </Typography>
//                 <Typography variant="body1">
//                   {analysisResults.feedback}
//                 </Typography>

//                 <div className='flex gap-6'>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleSubmitAssignment} // Submit when clicked
//                     sx={{ mt: 2 }}
//                   >
//                     Submit your Assignment
//                   </Button>

//                   <Button
//                     variant="contained"
//                     color="primary"
//                     onClick={handleDownloadPdf}
//                     sx={{ mt: 2 }}
//                   >
//                     Download Analysis as PDF
//                   </Button>
//                 </div>

//               </Box>
//             )}
//           </Box>
//         )}

//         {error && (
//           <Alert severity="error" sx={{ mt: 2 }}>
//             {error}
//           </Alert>
//         )}

//         {loading && (
//           <Box sx={{ mt: 2 }}>
//             <Typography variant="body2" color="text.secondary">
//               {progress === 0 ? 'Processing files...' :
//                 progress === 50 ? 'Analyzing content...' :
//                   'Completing analysis...'}
//             </Typography>
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default ReportUpload;
