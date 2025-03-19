import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import { firestore } from "../../firebase"; // your Firebase initialization file
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

function VideoScreen() {
  // Hardcoded video URL and filename
  const location = useLocation();
  const { videoId } = location.state;
  const [filename, setFilename] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const playerRef = useRef(null);
  const [isTeacher, setIsTeacher] = useState(false);

  // State for segments (from the video document), active tab, comments, and comment input
  const [segments, setSegments] = useState([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");


  const handleUser = async () => {
      try {
        // Save user ID in localStorage
        const userId = localStorage.getItem("userId");
  
        // Get user role from Flask API
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${userId}`,
        );
        const data = await response.json();
        const userRole = data.role;
        console.log("User role:", userRole);
  
        if(userRole === "teacher"){
          setIsTeacher(true);
        }
      } catch (error) {
        alert(error.message);
      }
    };

  // useEffect to subscribe to the video document and fetch its segments
  useEffect(() => {
    const fetchVideoData = async () => {
      handleUser();
      if (videoId) {
        const videoDocRef = doc(firestore, "videos", videoId);
        const unsubscribe = onSnapshot(videoDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFilename(data.filename || "");
            setVideoUrl(data.video_url || "");
            setSegments(data.segments || []);
            console.log("Segments:", data.segments);
          } else {
            console.log("Video document does not exist");
          }
        });
        return unsubscribe;
      }
    };

    const unsubscribePromise = fetchVideoData();
    return () => {
      if (unsubscribePromise && typeof unsubscribePromise === "function") {
        unsubscribePromise();
      }
    };
  }, [videoId]);

  // Comments: fetch comments in real time (sorted by timestamp ascending)
  useEffect(() => {
    if (!videoId) return;
    const q = query(
      collection(firestore, "videoComments"),
      orderBy("timestamp", "asc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only include comments for this specific video (by filename)
        if (data.videoId === videoId) {
          loadedComments.push({ id: doc.id, ...data });
        }
        console.log("Comments:", loadedComments);
      });
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [videoId]);

  // Function to add a comment to Firestore
  async function addCommentToFirestore(commentText, time) {
    try {
      await addDoc(collection(firestore, "videoComments"), {
        videoId: videoId,
        text: commentText,
        timestamp: time,
        createdAt: new Date(), // or serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  }

  // Handler for when a segment tab is clicked
  const handleSegmentClick = (index) => {
    setActiveSegmentIndex(index);
    if (playerRef.current) {
      // Jump to the start time of the selected segment
      playerRef.current.seekTo(segments[index].start, "seconds");
    }
  };

  // Handler for comment submission
  const handleAddComment = async () => {
    if (!commentInput.trim() || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    await addCommentToFirestore(commentInput.trim(), currentTime);
    setCommentInput("");
  };

  // Handler for clicking on a comment to jump to its timestamp
  const handleCommentClick = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, "seconds");
    }
  };

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    const currentSegmentIndex = segments.findIndex(
      (segment) => currentTime >= segment.start && currentTime <= segment.end,
    );
    if (
      currentSegmentIndex !== -1 &&
      currentSegmentIndex !== activeSegmentIndex
    ) {
      setActiveSegmentIndex(currentSegmentIndex);
    }
  };

  // Helper functions for processing segment functions (if needed)
  function combineNonEmptyArrays(obj) {
    return Object.values(obj)
      .filter((value) => Array.isArray(value) && value.length > 0)
      .flat();
  }

  const extractFunctionNames = (jsonString) => {
    // Remove markdown delimiters (e.g., ```json, ```python, or ```)
    const cleaned = jsonString.replace(/```[a-z]*\s*|\s*```/g, "");
    const trimmed = cleaned.trim();

    // Ensure it starts with '{'
    if (!trimmed.startsWith("{")) {
      console.warn("Invalid JSON format:", trimmed);
      return { functions: [], htmlTags: [] };
    }

    try {
      const parsed = JSON.parse(trimmed);
      return combineNonEmptyArrays(parsed);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return { functions: [], htmlTags: [] };
    }
  };

  const trepl = (text) => {
    return text === "Code" ? "Codes" : "Normal";
  };

  return (
    <div className="flex h-full flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 p-6 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-7xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
          Video Analysis Result
        </h2>
        <h3 className="mb-6 text-xl font-medium text-gray-600 dark:text-gray-300">
          {filename}
        </h3>

        <div className="relative mb-8 overflow-hidden rounded-lg shadow-md">
          <div className="flex items-center justify-center bg-black">
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              controls
              width="100%"
              height="100%"
              style={{ aspectRatio: "16/9" }}
              onError={(e) => console.error("ReactPlayer Error:", e)}
              onProgress={handleProgress}
              className="max-h-[500px]"
            />
          </div>
        </div>

        {/** Segment Navigation */}
        <div className="mb-6 flex flex-wrap gap-2">
          {segments.map((segment, index) => (
            <button
              key={index}
              onClick={() => handleSegmentClick(index)}
              className={`rounded-full px-4 py-2 font-medium transition-all ${
                index === activeSegmentIndex
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {trepl(segment.type)} ({parseInt(segment.start)}s -{" "}
              {parseInt(segment.end)}s)
            </button>
          ))}
        </div>

        {/** Display Active Segment Text */}
        <div className="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
          <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
            Extracted Text
          </h3>
          <p className="text-gray-700 dark:text-gray-200">
            {segments[activeSegmentIndex]?.text ||
              "No text available for this segment"}
          </p>
        </div>

        {segments[activeSegmentIndex]?.functions && (
          <div className="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
            <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
              Extracted Codes/IDE Settings
            </h3>
            <p className="text-gray-700 dark:text-gray-200">
              {segments[activeSegmentIndex]?.functions
                ?.flatMap((item) => extractFunctionNames(item))
                .join(", ") || "No code elements detected"}
            </p>
          </div>
        )}

        {/** Comments Section */}
        <div className="mb-6 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Comments
          </h3>
          <div className="mb-4 max-h-[250px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            {comments.length > 0 ? (
              comments.map((com) => (
                <div
                  key={com.id}
                  onClick={() => handleCommentClick(com.timestamp)}
                  className="mb-2 cursor-pointer rounded-lg border-l-4 border-blue-500 bg-gray-50 p-3 text-black transition-all hover:bg-blue-50 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                >
                  <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {formatTime(com.timestamp)}
                  </span>
                  {com.text}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400">
                No comments yet
              </p>
            )}
          </div>
        </div>

        {isTeacher && (
          <div className="flex gap-3">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment"
              className="flex-1 rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-600"
            />
            <button
              onClick={handleAddComment}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={!commentInput.trim()}
            >
              Comment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to format time (mm:ss)
function formatTime(seconds) {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss < 10 ? "0" : ""}${ss}`;
}

export default VideoScreen;
