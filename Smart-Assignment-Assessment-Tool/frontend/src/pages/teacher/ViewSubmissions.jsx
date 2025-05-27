import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../components/Header";
import { Card, Spinner, Button, Alert, Badge, TextInput } from "flowbite-react";
import { 
  HiArrowLeft, 
  HiOutlineCode, 
  HiDocumentText, 
  HiVideoCamera, 
  HiChevronRight, 
  HiExclamation, 
  HiCheck,
  HiSearch,
  HiFilter,
  HiDownload,
  HiUsers,
  HiAcademicCap,
  HiTrendingUp,
  HiClipboardList,
  HiStar
} from "react-icons/hi";

const ViewSubmissions = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [assignmentName, setAssignmentName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const navigate = useNavigate();
  

  const fetchUserData = async (uid) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${uid}`,
      );
      const data = await response.json();
      if (response.ok) {
        return {
          email: data.email,
          studentId: data.studentId || "N/A",
          studentName: data.studentName || "N/A"
        };
      } else {
        throw new Error(data.error || "Failed to fetch user.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return {
        email: null,
        studentId: uid,
        studentName: "Unknown"
      };
    }
  };

  const fetchReportSubmissionStatus = async (reportId) => {
    if (!reportId) return null;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/report/report-submissions/${reportId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: data.status || 'submitted',
          mark: data.mark || null
        };
      }
    } catch (error) {
      console.error("Error fetching report status:", error);
    }
    return null;
  };

  const getRepoUrl = async (codeId, submissionId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/get-github-url`,
        {
          params: { code_id: codeId },
        },
      );

      if (response.status === 200) {
        const githubUrl = response.data.github_url;
        await handleFetchRepo(githubUrl, codeId, submissionId);
      } else {
        setError("GitHub URL not found for this submission.");
      }
    } catch (error) {
      console.error("Error fetching GitHub URL:", error);
      setError("Failed to fetch the GitHub URL.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRepo = async (githubUrl, codeId, submissionId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/repo-details`,
        { params: { repo_url: githubUrl } },
      );

      if (response.status === 200) {
        navigate(`/view-code/${codeId}`, {
          state: { githubUrl, repoDetails: response.data, submissionId, codeId },
        });
      } else {
        setError("Failed to fetch repository details.");
      }
    } catch (error) {
      console.error("Error fetching repository:", error);
      setError("Failed to fetch the repository. Please check the URL.");
    }
  };

  const fetchAssignmentDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`,
      );
      const data = await response.json();
      if (response.ok) {
        setAssignmentName(data.name);
      }
    } catch (error) {
      console.error("Error fetching assignment details:", error);
    }
  };

  const handlePublishAllReports = async () => {
    setPublishLoading(true);
    setError("");
    setPublishSuccess("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/report/report-submissions/publish-assignment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            marking_reference: assignmentId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPublishSuccess(data.message);
        // Refresh submissions to show updated status
        await fetchSubmissions();
      } else {
        setError(data.error || "Failed to publish reports.");
      }
    } catch (error) {
      console.error("Error publishing reports:", error);
      setError("Failed to publish reports. Please try again.");
    } finally {
      setPublishLoading(false);
    }
  };

  const fetchWeight = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/marks/mark-weight/${assignmentId}`
      );
      const data = await response.json();

      console.log("Marking Scheme Data:", data);

      if (response.ok && data) {
        return data; // Return the marking scheme data directly
      }
      return null;
    } catch (error) {
      console.error("Error fetching marking scheme:", error);
      return null;
    }
  };

  const fetchSubmissions = async () => {
    try {
      // First fetch the marking scheme
      const weight = await fetchWeight();
      
      // Then fetch submissions as before
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionsByAssignment/${assignmentId}`,
      );
      const data = await response.json();

      if (response.ok) {
        const submissionsWithUserData = await Promise.all(
          data.submissions.map(async (submission) => {
            const userData = await fetchUserData(submission.student_id);
            const reportStatus = await fetchReportSubmissionStatus(submission.report_id);
            
            // Fetch all marks for this submission
            let marksData = {};
            try {
              const marksResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/marks/get-all-marks/${submission.submission_id}`
              );
              if (marksResponse.data) {
                marksData = marksResponse.data;
              }
            } catch (error) {
              console.error("Error fetching marks:", error);
            }

            // Calculate weighted final mark if marking scheme exists
            let finalMark = null;
            if (weight) {
              const codeWeight = weight.code_weight || 0;
              const videoWeight = weight.video_weight || 0;
              const reportWeight = weight.report_weight || 0;
              const vivaWeight = weight.viva_weight || 0;

              const codeMark = marksData.total_code_marks || 0;
              const videoMark = marksData.total_video_marks || 0;
              const reportMark = marksData.total_report_marks || 0;
              const vivaMark = marksData.total_viva_marks || 0;

              finalMark = (
                (codeMark * codeWeight + 
                 videoMark * videoWeight + 
                 reportMark * reportWeight + 
                 vivaMark * vivaWeight) / 100
              ).toFixed(2);
            }

            return { 
              ...submission, 
              email: userData.email,
              studentId: userData.studentId,
              studentName: userData.studentName,
              reportStatus: reportStatus?.status || null,
              reportMark: reportStatus?.mark || null,
              code_marks: marksData.total_code_marks || null,
              video_marks: marksData.total_video_marks || null,
              viva_marks: marksData.total_viva_marks || null,
              finalMark: finalMark,
              formattedDate: new Date(submission.created_at).toLocaleString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            };
          }),
        );
        setSubmissions(submissionsWithUserData);
        setFilteredSubmissions(submissionsWithUserData);
      } else {
        setError(data.error || "Failed to fetch submissions.");
      }
    } catch (error) {
      setError("Error fetching submissions: " + error.message);
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalSubmissions = submissions.length;
    const submissionsWithMarks = submissions.filter(s => s.finalMark !== null);
    const averageMark = submissionsWithMarks.length > 0 
      ? (submissionsWithMarks.reduce((sum, s) => sum + parseFloat(s.finalMark), 0) / submissionsWithMarks.length).toFixed(1)
      : 'N/A';
    
    const gradeDistribution = {
      excellent: submissionsWithMarks.filter(s => parseFloat(s.finalMark) >= 80).length,
      good: submissionsWithMarks.filter(s => parseFloat(s.finalMark) >= 70 && parseFloat(s.finalMark) < 80).length,
      satisfactory: submissionsWithMarks.filter(s => parseFloat(s.finalMark) >= 50 && parseFloat(s.finalMark) < 70).length,
      fail: submissionsWithMarks.filter(s => parseFloat(s.finalMark) < 50).length
    };

    const completionRate = totalSubmissions > 0 ? 
      ((submissions.filter(s => s.code_id || s.report_id || s.video_id).length / totalSubmissions) * 100).toFixed(1) : 0;

    const publishedReports = submissions.filter(s => s.reportStatus === 'published').length;

    return {
      totalSubmissions,
      averageMark,
      gradeDistribution,
      completionRate,
      publishedReports
    };
  };

  // Search and filter functionality
  useEffect(() => {
    let filtered = submissions.filter(submission => {
      const searchLower = searchTerm.toLowerCase();
      return (
        submission.studentName.toLowerCase().includes(searchLower) ||
        submission.studentId.toLowerCase().includes(searchLower) ||
        (submission.email && submission.email.toLowerCase().includes(searchLower))
      );
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Convert to string for comparison
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredSubmissions(filtered);
  }, [searchTerm, submissions, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      
      try {
        // Fetch assignment details
        await fetchAssignmentDetails();
        
        // Fetch submissions
        await fetchSubmissions();
      } catch (error) {
        setError("Error fetching data: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  // Function to go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const statusConfig = {
      submitted: { color: "yellow", text: "Submitted" },
      reviewed: { color: "blue", text: "Reviewed" },
      published: { color: "green", text: "Published" }
    };

    const config = statusConfig[status] || { color: "gray", text: status };
    
    return (
      <Badge color={config.color} size="sm">
        {config.text}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Email', 'Submitted', 'Code Mark', 'Video Mark', 'Report Mark', 'Viva Mark', 'Final Mark'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(submission => [
        submission.studentId,
        `"${submission.studentName}"`,
        submission.email || 'N/A',
        `"${submission.formattedDate}"`,
        submission.code_marks || 'N/A',
        submission.video_marks || 'N/A',
        submission.reportMark || 'N/A',
        submission.viva_marks || 'N/A',
        submission.finalMark || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assignmentName || 'assignment'}_submissions.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const statistics = getStatistics();

  return (
    <div className="min-h-screen transition-all duration-300 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 shadow-lg bg-white/95 backdrop-blur-sm dark:bg-gray-900/95 dark:border-gray-700">
        <Header />
      </div>
      
      <div className="container px-4 pt-24 pb-8 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <Button 
                color="light" 
                onClick={handleGoBack} 
                className="transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HiArrowLeft className="w-5 h-5 mr-2" />
                Back to Module
              </Button>
              <div>
                <h1 className="mb-1 text-3xl font-bold text-gray-900 dark:text-white">
                  {assignmentName ? `"${assignmentName}"` : "Assignment Submissions"}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <HiUsers className="w-4 h-4" />
                  <span>{filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button
                color="success"
                onClick={exportToCSV}
                disabled={filteredSubmissions.length === 0}
                className="flex items-center transition-transform hover:scale-105"
              >
                <HiDownload className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                color="blue"
                onClick={handlePublishAllReports}
                disabled={publishLoading}
                className="flex items-center transition-transform hover:scale-105"
              >
                {publishLoading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <HiCheck className="w-4 h-4 mr-2" />
                    Publish Marks
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Search Section - Made Smaller */}
          <div className="flex flex-col items-center justify-between gap-4 mb-2 md:flex-row">
            <div className="relative w-full md:w-96">
              <HiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <TextInput
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                sizing="md"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700">
              <HiFilter className="w-4 h-4" />
              <span>Showing {filteredSubmissions.length} of {submissions.length}</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert color="failure" className="mb-6 shadow-lg">
            <div className="flex items-center">
              <HiExclamation className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </Alert>
        )}

        {publishSuccess && (
          <Alert color="success" className="mb-6 shadow-lg">
            <div className="flex items-center">
              <HiCheck className="w-5 h-5 mr-2" />
              <span>{publishSuccess}</span>
            </div>
          </Alert>
        )}

        {/* Main Content */}
        {loading ? (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Spinner size="xl" className="mb-4" />
                <p className="text-lg text-gray-600 dark:text-gray-400">Loading submissions...</p>
              </div>
            </div>
          </Card>
        ) : filteredSubmissions.length > 0 ? (
          <Card className="overflow-hidden border-0 shadow-xl bg-white/95 backdrop-blur-sm dark:bg-gray-800/95">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white bg-gradient-to-r from-slate-700 to-slate-800">
                    <th 
                      scope="col" 
                      className="px-4 py-4 font-semibold text-left transition-colors border-r cursor-pointer hover:bg-slate-600 border-slate-600"
                      onClick={() => handleSort('studentId')}
                    >
                      <div className="flex items-center gap-2">
                        Student ID
                        {sortConfig.key === 'studentId' && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-4 font-semibold text-left transition-colors border-r cursor-pointer hover:bg-slate-600 border-slate-600"
                      onClick={() => handleSort('studentName')}
                    >
                      <div className="flex items-center gap-2">
                        Student Name
                        {sortConfig.key === 'studentName' && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-4 font-semibold text-center transition-colors border-r cursor-pointer hover:bg-slate-600 border-slate-600"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Submitted
                        {sortConfig.key === 'created_at' && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center border-r border-slate-600">
                      Component Marks
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-4 font-semibold text-center transition-colors border-r cursor-pointer hover:bg-slate-600 border-slate-600"
                      onClick={() => handleSort('finalMark')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        Final Mark
                        {sortConfig.key === 'finalMark' && (
                          <span className="text-xs">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center border-r border-slate-600">
                      Actions
                    </th>

                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSubmissions.map((submission, index) => (
                    <tr 
                      key={submission.submission_id} 
                      className={`
                        ${index % 2 === 0 
                          ? 'bg-white dark:bg-gray-800' 
                          : 'bg-gray-50/70 dark:bg-gray-900'
                        }
                      `}
                    >
                      <td className="px-4 py-4 font-semibold text-gray-900 border-r border-gray-200 dark:text-white dark:border-gray-700">
                        <div className="flex items-center">
                          <div className="w-2 h-2 mr-3 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                            {submission.studentId}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {submission.studentName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center border-r border-gray-200 dark:border-gray-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {submission.formattedDate}
                        </div>
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 text-center rounded-lg shadow-sm bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                            <div className="font-semibold text-blue-800 dark:text-blue-200">Code</div>
                            <div className="font-bold text-blue-600 dark:text-blue-300">{submission.code_marks || 'N/A'}</div>
                          </div>
                          <div className="p-2 text-center rounded-lg shadow-sm bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                            <div className="font-semibold text-green-800 dark:text-green-200">Video</div>
                            <div className="font-bold text-green-600 dark:text-green-300">{submission.video_marks || 'N/A'}</div>
                          </div>
                          <div className="p-2 text-center rounded-lg shadow-sm bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800">
                            <div className="font-semibold text-purple-800 dark:text-purple-200">Report</div>
                            <div className="font-bold text-purple-600 dark:text-purple-300">{submission.reportMark || 'N/A'}</div>
                          </div>
                          <div className="p-2 text-center rounded-lg shadow-sm bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800">
                            <div className="font-semibold text-orange-800 dark:text-orange-200">Viva</div>
                            <div className="font-bold text-orange-600 dark:text-orange-300">{submission.viva_marks || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center border-r border-gray-200 dark:border-gray-700">
                        {submission.finalMark !== null ? (
                          <div className="inline-flex items-center">
                            <Badge 
                              color={submission.finalMark >= 80 ? "success" : submission.finalMark >= 70 ? "info" : submission.finalMark >= 50 ? "warning" : "failure"} 
                              size="lg"
                              className="text-lg font-bold shadow-lg"
                            >
                              {submission.finalMark}%
                            </Badge>
                          </div>
                        ) : (
                          <Badge color="gray" size="sm">
                            N/A
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap justify-center gap-2">
                          {submission.code_id && (
                            <Button 
                              size="xs"
                              color="blue"
                              onClick={() => getRepoUrl(submission.code_id, submission.submission_id)}
                              className="flex items-center transition-all duration-200 shadow-md hover:scale-105 hover:shadow-lg"
                            >
                              <HiOutlineCode className="mr-1 text-sm" />
                              Code
                            </Button>
                          )}
                          {submission.report_id && (
                            <Button
                              size="xs"
                              color="success"
                              onClick={() => navigate(`/view-report/${submission.report_id}`)}
                              className="flex items-center transition-all duration-200 shadow-md hover:scale-105 hover:shadow-lg"
                            >
                              <HiDocumentText className="mr-1 text-sm" />
                              Report
                            </Button>
                          )}
                          {submission.video_id && (
                            <Button
                              size="xs"
                              color="warning"
                              onClick={() =>
                                navigate(`/videoSubmission/video-screen`, {
                                  state: {
                                    videoId: submission.video_id,
                                    submissionId: submission.submission_id,
                                    assignmentId: submission.assignment_id,
                                  },
                                })
                              }
                              className="flex items-center transition-all duration-200 shadow-md hover:scale-105 hover:shadow-lg"
                            >
                              <HiVideoCamera className="mr-1 text-sm" />
                              Video
                            </Button>
                          )}
                                                  <Button
                          size="sm"
                          color="purple"
                          onClick={() => navigate(`/viva-dashboard/${submission.submission_id}`)}
                          className="flex items-center transition-all duration-200 shadow-md hover:scale-105 hover:shadow-lg"
                          pill
                        >
                          Viva Dashboard
                          <HiChevronRight className="ml-1 text-sm" />
                        </Button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm dark:bg-gray-800/90">
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <HiUsers className="w-16 h-16 mb-4 text-gray-400" />
              <p className="mb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No submissions match your search' : 'No submissions found'}
              </p>
              {searchTerm && (
                <Button 
                  color="light" 
                  onClick={() => setSearchTerm('')}
                  size="sm"
                  className="transition-transform hover:scale-105"
                >
                  Clear search
                </Button>
              )}
            </div>
          </Card>
        )}

                  {/* Statistics Section */}
          <div className="grid grid-cols-1 gap-4 mt-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-white border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100">Total Submissions</p>
                  <p className="text-2xl font-bold">{statistics.totalSubmissions}</p>
                </div>
                <HiClipboardList className="w-8 h-8 text-blue-200" />
              </div>
            </Card>

            <Card className="text-white border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-100">Average Mark</p>
                  <p className="text-2xl font-bold">{statistics.averageMark}{statistics.averageMark !== 'N/A' ? '%' : ''}</p>
                </div>
                <HiAcademicCap className="w-8 h-8 text-green-200" />
              </div>
            </Card>

            <Card className="text-white border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100">Completion Rate</p>
                  <p className="text-2xl font-bold">{statistics.completionRate}%</p>
                </div>
                <HiTrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </Card>

            <Card className="text-white border-0 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-100">Grade A (80%+)</p>
                  <p className="text-2xl font-bold">{statistics.gradeDistribution.excellent}</p>
                </div>
                <HiStar className="w-8 h-8 text-pink-200" />
              </div>
            </Card>
          </div>
      </div>
    </div>
  );
};

export default ViewSubmissions;