import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner } from "flowbite-react";
import {
  HiCode,
  HiDocumentText,
  HiVideoCamera,
  HiArrowLeft,
} from "react-icons/hi";

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

  const handleNavigate = (type) => {
    alert(`Open ${type} results for submission ID: ${submissionId}`);
    // You can replace alerts with actual navigation when those pages are ready.
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-xl dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
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
                onClick={() => handleNavigate("code")}
                className="w-full flex items-center justify-center gap-2"
                disabled={!codeId}
              >
                <HiCode className="w-5 h-5" /> Code Results
              </Button>

              {/* Report Results Button */}
              <Button
                color="blue"
                onClick={() => handleNavigate("report")}
                className="w-full flex items-center justify-center gap-2"
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
                className="w-full flex items-center justify-center gap-2"
                disabled={!videoId}
              >
                <HiVideoCamera className="w-5 h-5" /> Video Results
              </Button>
            </div>
          )}

          <Button
            color="light"
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center justify-center gap-2"
          >
            <HiArrowLeft className="w-5 h-5" /> Back to Assignment
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default SubmissionResultsPage;
