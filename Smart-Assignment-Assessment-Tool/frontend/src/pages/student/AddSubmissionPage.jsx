import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import Header from "../../components/Header.jsx";

const AddSubmissionPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { assignmentId } = useParams();
    const { moduleId, moduleName } = location.state || {}; // Retrieve passed state

    const userId = localStorage.getItem("userId")

    // State variables
    const [githubUrl, setGithubUrl] = useState(""); // State for GitHub URL
    const [videoDocId, setVideoDocId] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const [submissionTypes, setSubmissionTypes] = useState({ code: false, report: false, video: false });

useEffect(() => {
    const fetchAssignmentDetails = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`);
            const data = await res.json();
            if (res.ok) {
                setSubmissionTypes(data.submission_types || { code: false, report: false, video: false });

                const storedData = JSON.parse(localStorage.getItem(assignmentId)) || {};
                if (storedData.githubUrl) setGithubUrl(storedData.githubUrl);
                if (storedData.videoDocId) setVideoDocId(storedData.videoDocId);
            } else {
                setError(data.error || "Failed to fetch assignment.");
            }
        } catch (err) {
            setError("Failed to load assignment: " + err.message);
        }
    };

    fetchAssignmentDetails();
}, [assignmentId]);



    const handleGithubUrlChange = (e) => {
        const newGithubUrl = e.target.value;
        setGithubUrl(newGithubUrl);
        const githubUrlRegex = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+(\.git)?\/?$/;

        if (!githubUrlRegex.test(newGithubUrl)) {
            setError("Please enter a valid GitHub repository URL.");
        } else {
            setError("");
            // Retrieve existing data for the assignmentId, if any
            const existingData = JSON.parse(localStorage.getItem(assignmentId)) || {};

            // Update the data with the new GitHub URL
            const updatedData = {
                ...existingData,
                githubUrl: newGithubUrl,
            };

            // Store the updated data back in localStorage
            localStorage.setItem(assignmentId, JSON.stringify(updatedData));
        }
    };

    // Handle Save action
    const handleSaveClick = async () => {
        if (!githubUrl) {
            setGithubUrl("");
            return;
        }

        setLoading(true);
        try {
            // Step 1: Create the submission (without submission ID for now)
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    assignment_id: assignmentId,
                    student_id: localStorage.getItem("userId"),
                    video_id: videoDocId || null,
                }),
            });

            const submissionData = await response.json();
            if (response.ok) {
                const submissionId = submissionData.submission_id;

                // Step 2: Save GitHub URL and retrieve the code ID
                const codeId = await saveGithubUrl(submissionId, githubUrl);

                // Step 3: Update the submission with the code ID
                await updateSubmissionWithCodeId(submissionId, codeId);

                // Step 4: If videoDocId is not null, update the videos collection
                if (videoDocId) {
                    const videoDocRef = doc(firestore, "videos", videoDocId);
                    await updateDoc(videoDocRef, {
                        submissionId: submissionId,
                    });
                }

                setLoading(false);
                // After saving the code ID, navigate to the submission view page
                navigate(`/assignment/${assignmentId}`);
            } else {
                setError(submissionData.error || "Failed to create repo submission!");
            }
        } catch (error) {
            setError("Failed to create repo submission: " + error.message);
            setLoading(false);
        }
    };

    // Save GitHub URL to the database and return the code ID
    const saveGithubUrl = async (submissionId, githubUrl) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/repo/add-repo-submission`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    submission_id: submissionId,
                    github_url: githubUrl,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                return data.code_id;  // Return the code ID after successfully saving the GitHub URL
            } else {
                throw new Error(data.error || "Failed to save GitHub URL!");
            }
        } catch (error) {
            throw new Error("Error saving GitHub URL: " + error.message);
        }
    };

    // Update the submission with the code ID
    const updateSubmissionWithCodeId = async (submissionId, codeId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    submission_id: submissionId,
                    code_id: codeId,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to update submission with code ID!");
            }
        } catch (error) {
            throw new Error("Error updating submission: " + error.message);
        }
    };

    const handleVideoNavigation = () => {
        navigate(`/videoSubmission/${assignmentId}`, {
            state: { moduleId, moduleName },
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

                    {/* GitHub URL input */}
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
                                className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white ${
                                        error && error.includes("GitHub") ? "border-red-500" : "border-gray-300"
                        }`}        />
                        </div>
                    )}

                    {/* Report submission */}
                    {submissionTypes.report && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Report
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate(`/report-submission/${assignmentId}`, {
                                    state: { assignmentId, moduleId, moduleName, userId }
                                })}
                                className="w-full rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-900 dark:focus:ring-blue-800"
                            >
                                Upload Report
                            </button>
                        </div>
                    )}

                    {/* Video submission */}
                    {submissionTypes.video && (
                        <div className="mb-4">
                            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Video
                            </label>
                            {videoDocId ? (
                                <p className="w-full rounded-md border border-gray-300 p-2 text-base dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                    <span className="font-semibold">Video Document ID: </span>{videoDocId}
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

                    {/* <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            GitHub Repository URL
                        </label>
                        <input
                            type="text"
                            placeholder="Enter GitHub URL..."
                            value={githubUrl}
                            onChange={handleGithubUrlChange}
                            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Report
                        </label>
                        <button
                            type="button"
                            onClick={() => navigate(`/report-submission/${assignmentId}`, { state: { assignmentId, moduleId, moduleName, userId } })}
                            className="w-full  rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-900 dark:focus:ring-blue-800"
                        >
                            Upload Report
                        </button>
                        {/* Add your report input or component here if needed */}
                    {/* </div>

                    <div className="mb-4">
                        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Video
                        </label>
                        {videoDocId ? (
                            <p className="w-full rounded-md  border border-gray-300 p-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                                <span className="font-semibold">Video Document ID: </span>
                                {videoDocId}
                            </p>
                        ) : (
                            <button
                                type="button"
                                onClick={handleVideoNavigation}
                                className="w-full  rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800 dark:hover:bg-gray-900 dark:focus:ring-blue-800"
                            >
                                Upload Video
                            </button>
                        )}
                    </div>  */}

                    <div className="mb-4 mt-16">
                        <button
                            type="button"
                            onClick={handleSaveClick}
                            disabled={loading}
                            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>

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