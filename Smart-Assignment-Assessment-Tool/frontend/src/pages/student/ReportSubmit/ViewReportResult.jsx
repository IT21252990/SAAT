import React, {useEffect, useState} from 'react'
import { useParams } from 'react-router-dom';
import Header from '../../../components/Header';
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
import { jsPDF } from "jspdf";
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

const ViewReportResult = () => {

    const { reportID } = useParams();

      const [reportSubmissions, setReportSubmissions] = useState([]);
      const [submissionID, setSubmissionID] = useState('');
      const [reportData, setReportData] = useState('');
    
useEffect(() => {
  const fetchAllReportSubmissions = async () => {
    try {
      console.log('Fetching report submissions for assignment ID:', reportID);
      const response = await fetch(`http://127.0.0.1:5000/api/v1/report/report-submissions/${reportID}`);
      const Reportdata = await response.json();

      console.log("report", Reportdata.student_id);

      if (response.ok) {
        // Assuming you have `userId` somewhere in scope
        // if (Reportdata.student_id === userId) {
          console.log("user has existing submission", Reportdata);
          setReportData(Reportdata);
        // }
        // setPlagiarismResults(Reportdata.plagiarism || "0");
        // setAnalysisResults(Reportdata.analysis_report || {});
      }

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
    //   setLoading(false);
    }
  };

  // ✅ Call the function here
  fetchAllReportSubmissions();
}, []);


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


      return (
    <div>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>

<div className='mt-20'>
        {/* analysis Results published reports */}
                {reportData.status === 'published' ? (
                  <div className='mx-auto max-w-[70%]'>
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
                          <div className="flex justify-between items-start mb-2">
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
) : (
  <div className="mt-6 p-4 w-[60%] mx-auto bg-yellow-50 border-2 border-yellow-200 rounded-xl shadow-sm">
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
      <span className="text-yellow-600 text-lg">⚠️</span>
    </div>
    <div>
      <h6 className="text-lg font-semibold text-yellow-800 mb-1">
        Results Pending Publication
      </h6>
      <p className="text-yellow-700 leading-relaxed">
        This results is not published yet. Analysis results will be displayed once the lecturer published the results. Please check back later for your detailed assessment and feedback.
      </p>
    </div>
  </div>
</div>
)}
</div>

    </div>
  )
}

export default ViewReportResult