import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner } from "flowbite-react";
import {
  HiCode,
  HiDocumentText,
  HiVideoCamera,
  HiArrowLeft,
} from "react-icons/hi";
import Header from "../components/Header";

const SubmissionResultsPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();

  const [assignmentId, setAssignmentId] = useState(null);
  const [videoId, setVideoId] = useState(null);
  const [codeId, setCodeId] = useState(null);
  const [reportId, setReportId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResultIds = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/submission/get-result-ids/${submissionId}`
        );
        const data = await res.json();
        if (res.ok) {
          setAssignmentId(data.assignment_id);
          setVideoId(data.video_id);
          setCodeId(data.code_id);
          setReportId(data.report_id);
        } else {
          console.error(data.error);
        }
      } catch (e) {
        console.error("Failed to fetch result IDs:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchResultIds();
  }, [submissionId]);

  const [reportSubmissions, setReportSubmissions] = useState([]);
  const [reportID, setReportID] = useState('');
  const [submissionID, setSubmissionID] = useState('');
  const [reportData, setReportData] = useState('');
  const [assignmentData, setAssignmentData] = useState('');

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/v1/submission/getSubmissionsByAssignment/${assignmentId}`
      );
      const data = await response.json();
      console.log("ids", data)
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

        // setError(null);
        setLoading(true);

        await fetchAssignmentDetails();

        console.log('Fetching report submissions for assignment ID:', reportID);
        console.log("hellow ")
        const response = await fetch(`http://127.0.0.1:5000/api/v1/report/report-submissions/${reportID}`);

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


        const AssignmentResponse = await fetch(`http://127.0.0.1:5000/api/v1/assignment/getAssignment/${assignmentId}`);

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

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>

      <main className="container max-w-4xl px-4 pt-40 pb-5 mx-auto">
        <Card className="p-8 shadow-xl dark:border-gray-700">
          <h1 className="mb-6 text-2xl font-bold text-center text-gray-900 dark:text-white">
            Submission Results
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="xl" />
              <span className="ml-4 text-gray-600 dark:text-gray-300">
                Loading...
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Code Results Button */}
              <Button
                color="purple"
                onClick={() => navigate("/view-code-submission-results", {
                  state: { codeId, submissionId }
                })}
                className="flex items-center justify-center w-full gap-2"
                disabled={!codeId}
              >
                <HiCode className="w-5 h-5" /> Code Results
              </Button>

              {/* Report Results Button */}
              <Button
                color="blue"
                onClick={() => navigate(`/view-report-results/${reportId}`)}
                className="flex items-center justify-center w-full gap-2"
                disabled={!reportId}
              >
                <HiDocumentText className="w-5 h-5" /> Report Results
              </Button>

              {/* Video Results Button */}
              <Button
                color="success"
                onClick={() =>
                  navigate("/videoSubmission/video-screen", {
                    state: { videoId, assignmentId, submissionId },
                  })
                }
                className="flex items-center justify-center w-full gap-2"
                disabled={!videoId}
              >
                <HiVideoCamera className="w-5 h-5" /> Video Results
              </Button>
            </div>
          )}

          <Button
            color="light"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 mt-6"
          >
            <HiArrowLeft className="w-5 h-5" /> Back to Assignment
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default SubmissionResultsPage;
