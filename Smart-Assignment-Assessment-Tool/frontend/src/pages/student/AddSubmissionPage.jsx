import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import Header from "../../components/Header.jsx";

const AddSubmissionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { assignmentId } = useParams();
    const { moduleId, moduleName, submissionId1 = null } = location.state || {};

    const userId = localStorage.getItem("userId");

    const [githubUrl, setGithubUrl] = useState("");
    const [videoDocId, setVideoDocId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [submissionTypes, setSubmissionTypes] = useState({ code: false, report: false, video: false });
    const [submissionId, setSubmissionId] = useState(submissionId1 || null);
    const [codeId, setCodeId] = useState(null);
    const [reportId, setReportId] = useState(null);
    const [initialized, setInitialized] = useState(false);

    // Use ref to prevent multiple initialization calls
    const initializingRef = useRef(false);

    console.log("submissionId1", submissionId1);

    // Check if a submission already exists for this (assignmentId, userId).
    const checkExistingSubmission = async (assignmentId, userId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/check-submission`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignment_id: assignmentId,
                    student_id: userId,
                }),
            });

            const data = await res.json();
            if (res.ok && data.exists) {
                console.log("Submission already exists for this student:", data.submission_id);
                return data.submission_id;
            } else {
                return null;
            }
        } catch (err) {
            console.error("Error checking submission:", err);
            return null;
        }
    };

    // Empty submission
    const createEmptySubmission = async (assignmentId, userId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignment_id: assignmentId,
                    student_id: userId,
                }),
            });
            const payload = await res.json();
            if (res.ok) {
                console.log("Created submission:", payload.submission_id);
                return payload.submission_id;
            } else {
                throw new Error(payload.error || "Failed to create submission");
            }
        } catch (err) {
            console.error("Error creating submission:", err);
            return null;
        }
    };

    //  Fetch the existing submission
    const fetchSubmissionData = async (subId) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/submission/getSubmissionsBySubmission/${subId}`
            );
            const data = await res.json();
            if (res.ok) {
                const { code_id, report_id, video_id } = data.submission_data;
                return { code_id, report_id, video_id };
            }
        } catch (err) {
            console.error("Error fetching submission data:", err);
        }
        return {};
    };

    //  Get saved GitHub URL from repo collection
    const fetchGithubUrlByCodeId = async (cId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/get-repo/${cId}`);
            const payload = await res.json();
            if (res.ok) {
                return payload.github_url;
            }
        } catch (err) {
            console.error("Error fetching GitHub URL by codeId:", err);
        }
        return "";
    };

    // patch the existing submission with codeId
    const patchCodeId = async (codeId) => {
        if (!submissionId) {
            console.warn("No submissionId available yet.");
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/update-fields`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submission_id: submissionId,
                    code_id: codeId,
                }),
            });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || "Failed to update code_id");
            }
        } catch (err) {
            console.error("Error updating code_id:", err);
        }
    };

    // videoDocId patch
    const patchVideoId = async (videoId) => {
        if (!submissionId) {
            console.warn("No submissionId available yet.");
            return;
        }
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/update-video`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submission_id: submissionId,
                    video_id: videoId,
                }),
            });
            if (!res.ok) {
                const payload = await res.json();
                throw new Error(payload.error || "Failed to update video_id");
            }
        } catch (err) {
            console.error("Error updating video_id:", err);
        }
    };

    const saveGithubUrlAndUpdateSubmission = async (submissionId, githubUrl) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/add-repo-submission`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submission_id: submissionId,
                    github_url: githubUrl,
                }),
            });
            const payload = await res.json();
            if (res.ok) {
                const codeId = payload.code_id;
                // Now patch the submission's code_id field
                await patchCodeId(codeId);
                return codeId;
            } else {
                throw new Error(payload.error || "Failed to save GitHub URL");
            }
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    // Main initialization effect - runs only once when component mounts
    useEffect(() => {
        const initializeComponent = async () => {
            // Prevent multiple initialization calls
            if (!assignmentId || !userId || initialized || initializingRef.current) {
                return;
            }

            // Set the ref to prevent concurrent calls
            initializingRef.current = true;

            try {
                console.log("------------------Initializing AddSubmissionPage---------------");
                console.log("Assignment ID:", assignmentId);
                console.log("User ID:", userId);
                console.log("Submission ID from props:", submissionId1);
                console.log("---------------------------------");

                // 1. Fetch assignment data first
                const assignmentRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`);
                const assignmentData = await assignmentRes.json();
                if (assignmentRes.ok) {
                    setSubmissionTypes(assignmentData.submission_types || { code: false, report: false, video: false });
                } else {
                    setError(assignmentData.error || "Failed to fetch assignment.");
                    return;
                }

                // 2. Determine submission ID with priority for passed submissionId
                let currentSubmissionId = submissionId1;
                
                if (!currentSubmissionId) {
                    console.log("No submissionId provided, checking for existing submission...");
                    // Check if submission already exists
                    const existingId = await checkExistingSubmission(assignmentId, userId);
                    if (existingId) {
                        currentSubmissionId = existingId;
                        console.log("Found existing submission:", existingId);
                    } else {
                        // Create new submission only if none exists
                        console.log("No existing submission found, creating new one...");
                        const newId = await createEmptySubmission(assignmentId, userId);
                        if (newId) {
                            currentSubmissionId = newId;
                            console.log("Created new submission:", newId);
                        } else {
                            setError("Could not create initial submission");
                            return;
                        }
                    }
                } else {
                    console.log("Using provided submissionId:", currentSubmissionId);
                }

                // 3. Set submission ID
                setSubmissionId(currentSubmissionId);

                // 4. Fetch existing submission data if we have a submission ID
                if (currentSubmissionId) {
                    console.log("Fetching submission data for ID:", currentSubmissionId);
                    const { code_id, video_id, report_id } = await fetchSubmissionData(currentSubmissionId);

                    // Set the IDs first
                    if (code_id) setCodeId(code_id);
                    if (video_id) setVideoDocId(video_id);
                    if (report_id) setReportId(report_id);

                    // Then fetch the GitHub URL if we have a code_id
                    if (code_id) {
                        const url = await fetchGithubUrlByCodeId(code_id);
                        setGithubUrl(url);
                    }
                }

                setInitialized(true);
            } catch (err) {
                console.error("Error initializing component:", err);
                setError("Failed to load submission data: " + err.message);
            } finally {
                // Always reset the ref, even if there was an error
                initializingRef.current = false;
            }
        };

        initializeComponent();
    }, [assignmentId, userId, submissionId1]); // Simplified dependency array

    const handleGithubUrlChange = (e) => {
        const newGithubUrl = e.target.value;
        setGithubUrl(newGithubUrl);

        const githubUrlRegex = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$/;
        if (!githubUrlRegex.test(newGithubUrl)) {
            setError("Please enter a valid GitHub repository URL.");
        } else {
            setError("");
            // Save to localStorage so it persists across page reloads/navigations:
            const existingData = JSON.parse(localStorage.getItem(assignmentId)) || {};
            const updatedData = { ...existingData, githubUrl: newGithubUrl };
            localStorage.setItem(assignmentId, JSON.stringify(updatedData));
        }
    };

    const handleSaveClick = async () => {
        if (!submissionId) {
            setError("Still initializing submission. Please wait a moment and try again.");
            return;
        }

        setLoading(true);
        if (githubUrl) {
            try {
                //Save to your repo‐route to get back code_id
                const codeId = await saveGithubUrlAndUpdateSubmission(submissionId, githubUrl);

                // update localStorage with codeId
                const storedData = JSON.parse(localStorage.getItem(assignmentId)) || {};
                localStorage.setItem(
                    assignmentId,
                    JSON.stringify({ ...storedData, codeId })
                );

                // Navigate back to assignment overview
                navigate(`/assignment/${assignmentId}`);
            }
            catch (err) {
                setError("Failed to save GitHub URL: " + err.message);
            }
        } else {
            // If no GitHub URL, just navigate back
            navigate(`/assignment/${assignmentId}`);
        }
        setLoading(false);
    };

    // Handle video navigation
    const handleVideoNavigation = () => {
        navigate(`/videoSubmission/${assignmentId}`, {
            state: { moduleId, moduleName, submissionId },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
            <Header />
            <div className="mt-12 w-full max-w-md rounded-lg border border-gray-200 bg-white p-10 shadow-md dark:border-gray-600 dark:bg-gray-700">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                    Add Submission
                </h2>

                {error && <p className="mb-4 text-red-500">{error}</p>}

                <form>
                    {/* ── GitHub URL input ─────────────────────────────────────────────── */}
                    {submissionTypes.code && (
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                GitHub Repository URL
                            </label>
                            <input
                                type="text"
                                placeholder="Enter GitHub URL..."
                                value={githubUrl}
                                onChange={handleGithubUrlChange}
                                className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${error && error.includes("GitHub") ? "border-red-500" : "border-gray-300"
                                    }`}
                            />
                        </div>
                    )}

                    {/* ── Report upload button ─────────────────────────────────────────── */}
                    {submissionTypes.report && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Report
                            </label>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(`/report-submission/${assignmentId}`, {
                                        state: { assignmentId, moduleId, moduleName, userId, submissionId },
                                    })
                                }
                                className="w-full rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-900 dark:focus:ring-blue-800"
                            >
                                Upload Report
                            </button>
                        </div>
                    )}

                    {/* ── Video upload button / ID display ─────────────────────────────── */}
                    {submissionTypes.video && (
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Video
                            </label>
                            {videoDocId ? (
                                <p className="w-full rounded-md border border-gray-300 p-2 text-base dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                    <span className="font-semibold">Video Document ID: </span>
                                    {videoDocId}
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleVideoNavigation}
                                    className="w-full rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-900 dark:focus:ring-blue-800"
                                >
                                    Upload Video
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── Save Button ──────────────────────────────────────────────────── */}
                    <div className="mb-4 mt-16">
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            disabled={loading || !initialized}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : !initialized ? "Loading..." : "Save"}
                        </button>
                    </div>

                    {/* ── Cancel Button ────────────────────────────────────────────────── */}
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate(`/assignment/${assignmentId}`)}
                            className="w-full rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-500 dark:hover:bg-gray-600 dark:focus:ring-gray-800"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddSubmissionPage;