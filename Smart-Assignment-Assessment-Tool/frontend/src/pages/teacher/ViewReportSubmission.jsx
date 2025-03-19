import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Get report_id from URL
import axios from "axios";
import { Box, Typography, Button } from "@mui/material";

const ViewReportSubmission = () => {
  const { report_id } = useParams(); // Extract report_id from URL
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/v1/report/report-submissions/${report_id}`
        );
        setReportData(response.data); // Store API response
      } catch (err) {
        setError("Failed to fetch report data");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [report_id]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!reportData) return <Typography>No report data available.</Typography>;

  const { analysis_report, aiContent, plagiarism } = reportData;

  return (
    <Box sx={{ mt: 4, p: 3, border: "1px solid #ccc ", borderRadius: 1 }}>
      <Typography variant="h5" gutterBottom>
        Student Report Analysis
      </Typography>

      {/* AI Content & Plagiarism Results */}
      <div className="flex gap-x-4">
        {/* AI Content Percentage */}
        <Box sx={{ mt: 4 }} className="border-2 p-[1.5rem] rounded-md border-[#1976d22b] w-1/2">
          <Typography variant="h5" color="primary">
            {aiContent?.percentage || "N/A"}%
          </Typography>
          <Typography variant="h8" gutterBottom>
            {aiContent?.percentage !== undefined
              ? "of this report appears to be AI-generated"
              : "Unable to calculate AI content percentage."}
          </Typography>
        </Box>

        {/* Plagiarism Percentage */}
        <Box sx={{ mt: 4 }} className="border-2 p-[1.5rem] rounded-md border-[#1976d22b] w-1/2">
          <Typography variant="h5" color="primary">
            {plagiarism || "N/A"}%
          </Typography>
          <Typography variant="h8" gutterBottom>
            {plagiarism !== undefined
              ? "Found significant plagiarism in your report"
              : "Unable to calculate plagiarism percentage."}
          </Typography>
        </Box>
      </div>

      {/* Analysis Report */}
      {analysis_report && (
        <Box sx={{ mt: 4, p: 3, border: "1px solid #ccc", borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            Analysis Results
          </Typography>
          <Typography variant="h5" color="primary">
            Overall Score: {analysis_report.totalScore || 0}%
          </Typography>

          {analysis_report.criteria?.map((criterion, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {criterion.description}
              </Typography>
              <Typography>
                Score: {criterion.awarded} / {criterion.weightage} points
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Justification: {criterion.justification}
              </Typography>
              {criterion.suggestions?.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Suggestions for improvement:
                  </Typography>
                  <ul style={{ margin: "4px 0" }}>
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

          {analysis_report.feedback && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                General Feedback
              </Typography>
              <Typography variant="body1">{analysis_report.feedback}</Typography>

              {/* <div className="flex gap-6">
                <Button variant="contained" color="primary" onClick={() => alert("Assignment Submitted")} sx={{ mt: 2 }}>
                  Submit your Assignment
                </Button>

                <Button variant="contained" color="primary" onClick={() => alert("Downloading PDF...")} sx={{ mt: 2 }}>
                  Download Analysis as PDF
                </Button>
              </div> */}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ViewReportSubmission;
