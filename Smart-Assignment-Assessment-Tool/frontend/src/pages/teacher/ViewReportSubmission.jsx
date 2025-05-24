import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  Paper,
  Grid,
  CircularProgress
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Assessment as AssessmentIcon
} from "@mui/icons-material";
import Header from "../../components/Header";


const ViewReportSubmission = () => {
  const { report_id } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit mark states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMark, setEditMark] = useState("");
  const [editFeedback, setEditFeedback] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/api/v1/report/report-submissions/${report_id}`
        );
        setReportData(response.data);
      } catch (err) {
        setError("Failed to fetch report data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (report_id) {
      fetchReport();
    }
  }, [report_id]);

  const handleEditClick = () => {
    setEditMark(reportData?.mark || "");
    setEditFeedback(reportData?.instructor_feedback || "");
    setEditDialogOpen(true);
    setUpdateSuccess(false);
  };

  const handleUpdateMark = async () => {
    if (!editMark || editMark < 0 || editMark > 100) {
      setError("Please enter a valid mark between 0 and 100");
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/api/v1/report/report-submissions/${report_id}/review`,
        {
          mark: parseFloat(editMark),
          feedback: editFeedback
        }
      );

      // Update local state with new data
      setReportData(response.data.report);
      setUpdateSuccess(true);
      
      // Close dialog after a short delay
      setTimeout(() => {
        setEditDialogOpen(false);
        setUpdateSuccess(false);
      }, 1500);

    } catch (err) {
      setError("Failed to update mark. Please try again.");
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseDialog = () => {
    setEditDialogOpen(false);
    setEditMark("");
    setEditFeedback("");
    setError(null);
    setUpdateSuccess(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'warning';
      case 'reviewed': return 'success';
      case 'published': return 'primary';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  if (error && !reportData) return (
    <Alert severity="error" sx={{ mt: 2 }}>
      {error}
    </Alert>
  );

  if (!reportData) return (
    <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
      No report data available.
    </Typography>
  );

  const { analysis_report, aiContent, plagiarism, status, submission_date, reviewed_date } = reportData;

  return (
    <div>
    <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
            <Header />
          </div>
    <Box sx={{ mt: 8, maxWidth: 900, mx: 'auto', p: 2 }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <AssessmentIcon sx={{ mr: 2, fontSize: 32 }} />
            Student Report Analysis
          </Typography>
          <Chip 
            label={status?.toUpperCase() || 'SUBMITTED'} 
            color={getStatusColor(status)}
            size="large"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Report ID:</strong> {report_id}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">
              <strong>Submitted:</strong> {formatDate(submission_date)}
            </Typography>
          </Grid>
          {reviewed_date && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Reviewed:</strong> {formatDate(reviewed_date)}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Current Mark Display */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" gutterBottom>
              Current Mark
            </Typography>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
              {reportData.mark !== null && reportData.mark !== undefined ? reportData.mark : 'Not Graded'}
              {reportData.mark !== null && reportData.mark !== undefined && '/100'}
            </Typography>
            {reportData.instructor_feedback && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Instructor Feedback:</strong> {reportData.instructor_feedback}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            size="large"
          >
            Edit Mark
          </Button>
        </Box>
      </Paper>

      {/* AI Content & Plagiarism Results */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', border: '2px solid #e3f2fd' }}>
            <Typography variant="h4" color="primary" gutterBottom>
              {aiContent?.percentage || "N/A"}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {aiContent?.percentage !== undefined
                ? "of this report appears to be AI-generated"
                : "Unable to calculate AI content percentage"}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center', border: '2px solid #fff3e0' }}>
            <Typography variant="h4" color="warning.main" gutterBottom>
              {plagiarism || "N/A"}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {plagiarism !== undefined
                ? "Found significant plagiarism in your report"
                : "Unable to calculate plagiarism percentage"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Analysis Report */}
      {analysis_report && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Analysis Results
          </Typography>
          
          <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Typography variant="h6" color="white">
              Overall Score: {analysis_report.totalScore || 0}%
            </Typography>
          </Box>

          {analysis_report.criteria?.map((criterion, index) => (
            <Box key={index} sx={{ mb: 2, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                {criterion.description}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Score:</strong> {criterion.awarded} / {criterion.weightage} points
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Justification:</strong> {criterion.justification}
              </Typography>
              {criterion.suggestions?.length > 0 && (
                <Box>
                  <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
                    Suggestions for improvement:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {criterion.suggestions.map((suggestion, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
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
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" gutterBottom>
                  General Feedback
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {analysis_report.feedback}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* Edit Mark Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {updateSuccess ? 'Mark Updated Successfully!' : 'Edit Student Mark'}
        </DialogTitle>
        <DialogContent>
          {updateSuccess ? (
            <Box textAlign="center" py={2}>
              <CheckCircleIcon color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="success.main">
                Mark and feedback have been updated successfully!
              </Typography>
            </Box>
          ) : (
            <Box>
              <TextField
                autoFocus
                margin="dense"
                label="Mark (0-100)"
                type="number"
                fullWidth
                variant="outlined"
                value={editMark}
                onChange={(e) => setEditMark(e.target.value)}
                inputProps={{ min: 0, max: 100 }}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Instructor Feedback (Optional)"
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={editFeedback}
                onChange={(e) => setEditFeedback(e.target.value)}
                placeholder="Add feedback for the student..."
              />
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!updateSuccess && (
            <>
              <Button onClick={handleCloseDialog} startIcon={<CancelIcon />}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateMark} 
                variant="contained"
                startIcon={updating ? <CircularProgress size={16} /> : <SaveIcon />}
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Mark'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
    </div>
  );
};

export default ViewReportSubmission;