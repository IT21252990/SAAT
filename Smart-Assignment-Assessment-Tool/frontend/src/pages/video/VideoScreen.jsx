import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import { firestore, auth } from "../../firebase";
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import Header from "../../components/Header.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function VideoScreen() {
  const location = useLocation();
  const { videoId, assignmentId, submissionId } = location.state || {};

  const [filename, setFilename] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoUserId, setVideoUserId] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);

  const playerRef = useRef(null);
  const latestCommentRef = useRef(null);

  const [segments, setSegments] = useState([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [markingScheme, setMarkingScheme] = useState(null);
  const [marks, setMarks] = useState({});
  const [marksLoaded, setMarksLoaded] = useState(false);
  const [marksDocId, setMarksDocId] = useState(null);

  useEffect(() => {
    const handleUser = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${userId}`
        );
        const data = await response.json();

        if (data.role === "teacher") {
          setIsTeacher(true);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    handleUser();

    if (!videoId) return;
    const videoDocRef = doc(firestore, "videos", videoId);
    return onSnapshot(videoDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFilename(data.filename || "");
        setVideoUrl(data.video_url || "");
        setSegments(data.segments || []);
        setVideoUserId(data.userId || "");
        console.log("Video data:", data);
      }
    });
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    const q = query(collection(firestore, "videoComments"), orderBy("timestamp"));
    return onSnapshot(q, (snapshot) => {
      const loadedComments = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.videoId === videoId) {
          loadedComments.push({ id: doc.id, ...data });
        }
      });
      setComments(loadedComments);
      console.log("Comments data:", loadedComments);
    });
  }, [videoId]);

  useEffect(() => {
    if (latestCommentRef.current) {
      latestCommentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [comments]);

  useEffect(() => {
    if (!assignmentId) return;
    const fetchScheme = async () => {
      const schemesRef = collection(firestore, "marking_schemes");
      const q = query(schemesRef, where("assignment_id", "==", assignmentId));
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const docSnap = querySnap.docs[0];
        const data = docSnap.data();
        setMarkingScheme({ id: docSnap.id, ...data });

        const videoArr = data.criteria?.video || [];
        const initialMarks = {};
        videoArr.forEach((c) => (initialMarks[c.criterion] = ""));
        setMarks(initialMarks);
      }
    };
    fetchScheme();
  }, [assignmentId]);

  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (!markingScheme || !videoId || !submissionId || !videoUserId || marksLoaded) return;
      try {
        const marksRef = collection(firestore, "video_marks");
        const q = query(
          marksRef,
          where("assignmentId", "==", assignmentId),
          where("videoId", "==", videoId),
          where("submissionId", "==", submissionId),
          where("userId", "==", videoUserId)
        );
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const docSnap = querySnap.docs[0];
          const stored = docSnap.data().marks || {};
          setMarksDocId(docSnap.id);

          const videoArr = markingScheme.criteria?.video || [];
          const updatedMarks = {};
          videoArr.forEach((c) => {
            updatedMarks[c.criterion] = stored[c.criterion] !== undefined ? String(stored[c.criterion]) : "";
          });
          setMarks(updatedMarks);
        }
      } catch (err) {
        console.error("Error fetching existing marks:", err);
      } finally {
        setMarksLoaded(true);
      }
    };
    fetchExistingMarks();
  }, [markingScheme, videoId, submissionId, videoUserId, marksLoaded, assignmentId]);

  async function addCommentToFirestore(commentText, time) {
    try {
      await addDoc(collection(firestore, "videoComments"), {
        videoId,
        text: commentText,
        timestamp: time,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  }

  const handleSegmentClick = (index) => {
    setActiveSegmentIndex(index);
    if (playerRef.current) {
      playerRef.current.seekTo(segments[index].start, "seconds");
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || !playerRef.current || isSubmittingComment) return;
    setIsSubmittingComment(true);
    const currentTime = playerRef.current.getCurrentTime();
    await addCommentToFirestore(commentInput.trim(), currentTime);
    setCommentInput("");
    setTimeout(() => setIsSubmittingComment(false), 500);
  };

  const handleCommentClick = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, "seconds");
    }
  };

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    const currentSegmentIndex = segments.findIndex(
      (segment) => currentTime >= segment.start && currentTime <= segment.end
    );
    if (currentSegmentIndex !== -1 && currentSegmentIndex !== activeSegmentIndex) {
      setActiveSegmentIndex(currentSegmentIndex);
    }
  };

  const handleMarkChange = (criterion, value) => {
    if (!isTeacher) return;
    if (/^\d*$/.test(value)) {
      setMarks((prev) => ({ ...prev, [criterion]: value }));
    }
  };

  const handleSaveMarks = async () => {
    if (!markingScheme) return;

    const videoArr = markingScheme.criteria?.video || [];
    for (let critObj of videoArr) {
      const crit = critObj.criterion;
      const val = marks[crit];
      if (val === "" || isNaN(Number(val))) {
        toast.error(`Please enter a valid numeric mark for "${crit}"`);
        return;
      }
    }

    const newMarksObject = {};
    Object.entries(marks).forEach(([crit, strValue]) => {
      newMarksObject[crit] = Number(strValue);
    });

    try {
      if (marksDocId) {
        const docRef = doc(firestore, "video_marks", marksDocId);
        await updateDoc(docRef, {
          marks: newMarksObject,
          updatedAt: serverTimestamp(),
        });
        toast.success("Marks updated successfully!");
      } else {
        await addDoc(collection(firestore, "video_marks"), {
          assignmentId,
          userId: videoUserId,
          submissionId,
          videoId,
          marks: newMarksObject,
          createdAt: serverTimestamp(),
        });
        toast.success("Marks saved successfully!");
      }
    } catch (err) {
      console.error("Error saving marks:", err);
      toast.error("Failed to save marks.");
    }
  };

  function formatTime(seconds) {
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const ss = Math.floor(seconds % 60);
    return [
      hh > 0 ? String(hh).padStart(2, "0") : null,
      String(mm).padStart(2, "0"),
      String(ss).padStart(2, "0"),
    ].filter(Boolean).join(":");
  }

  function combineNonEmptyArrays(obj) {
    return Object.values(obj)
      .filter((value) => Array.isArray(value) && value.length > 0)
      .flat();
  }

  const extractFunctionNames = (jsonString) => {
    const cleaned = jsonString.replace(/```[a-z]*\s*|\s*```/g, "");
    const trimmed = cleaned.trim();

    if (!trimmed.startsWith("{")) return { functions: [], htmlTags: [] };

    try {
      const parsed = JSON.parse(trimmed);
      return combineNonEmptyArrays(parsed);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return { functions: [], htmlTags: [] };
    }
  };

  return (
    <div className="flex h-full flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Header />
      <div className="mt-12 w-full max-w-7xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">

        <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
          Video Analysis & Marking
        </h2>
        <h3 className="mb-6 text-xl font-medium text-gray-600 dark:text-gray-300">
          {filename}
        </h3>

        {/* VIDEO PLAYER */}
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

        {/* SEGMENT BUTTONS */}
        <div className="mb-6 flex flex-wrap gap-2">
          {segments.map((segment, index) => (
            <button
              key={index}
              onClick={() => handleSegmentClick(index)}
              title={segment.text?.slice(0, 100) || "No preview"}
              className={`rounded-full px-4 py-2 font-medium transition-all ${index === activeSegmentIndex
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              {segment.type === "Code" ? "Codes" : "Normal"} (
              {formatTime(segment.start)} - {formatTime(segment.end)})
            </button>
          ))}
        </div>


        {/* ACTIVE SEGMENT TEXT */}
        <div className="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
          <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
            Extracted Text
          </h3>
          <p className="text-gray-700 dark:text-gray-200">
            {segments[activeSegmentIndex]?.text || "No text available for this segment"}
          </p>
        </div>

        {/* CODE FUNCTION NAMES */}
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

        {/* COMMENTS LIST */}
        <div className="mb-6 border-t border-gray-200 pt-6 dark:border-gray-700">
          <h3 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">
            Comments
          </h3>
          <div className="mb-4 max-h-[250px] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            {comments.length > 0 ? (
              comments.map((com, idx) => (
                <div
                  key={com.id}
                  ref={idx === comments.length - 1 ? latestCommentRef : null}
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
              <p className="text-center text-gray-500 dark:text-gray-400">No comments yet</p>
            )}
          </div>
        </div>

        {/* COMMENT INPUT (TEACHER ONLY) */}
        {isTeacher && (
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment"
              className="flex-1 rounded-lg border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-600"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentInput.trim() || isSubmittingComment}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Comment
            </button>
          </div>
        )}

        {/* MARKING SCHEME */}
        {isTeacher && (markingScheme?.criteria?.video?.length ?? 0) > 0 && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-white">
              Marking Scheme: {markingScheme.title || ""}
            </h3>

            {markingScheme.criteria.video.map((critObj, idx) => {
              const {
                criterion,
                weightage,
                high_description,
                medium_description,
                low_description,
                type_weight,
              } = critObj;
              return (
                <div key={idx} className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                      {criterion} ({weightage}%)
                    </h4>
                    <input
                      type="text"
                      value={marks[criterion] || ""}
                      onChange={(e) => handleMarkChange(criterion, e.target.value)}
                      placeholder={`Enter mark (max ${type_weight})`}
                      disabled={!isTeacher}
                      className={`w-24 rounded border px-2 py-1 focus:outline-none ${isTeacher
                        ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-600"
                        : "border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed"
                        }`}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>High:</strong> {high_description} &nbsp;|&nbsp;
                    <strong>Med:</strong> {medium_description} &nbsp;|&nbsp;
                    <strong>Low:</strong> {low_description}
                  </p>
                </div>
              );
            })}

            {isTeacher && (
              <div className="flex justify-end">
                <button
                  onClick={handleSaveMarks}
                  className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  Save Marks
                </button>
              </div>
            )}
          </div>
        )}

        {/* STUDENT VIEW: SEE RESULTS */}
        {!isTeacher && marksLoaded && Object.keys(marks).length > 0 && (
  <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
    <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white">
      Your Marks
    </h3>

    <div className="space-y-3">
      {Object.entries(marks).map(([criterion, value], idx) => (
        <div key={idx} className="flex justify-between items-center border-b pb-2 border-gray-200 dark:border-gray-600">
          <span className="text-gray-700 dark:text-gray-300">{criterion}</span>
          <span className="font-semibold text-gray-800 dark:text-gray-100">{value}</span>
        </div>
      ))}
    </div>

    <div className="mt-6 flex justify-between items-center rounded-md py-3">
      <span className="text-lg font-medium text-gray-700 dark:text-gray-300">Total</span>
      <span className="text-lg font-bold text-green-600 dark:text-green-400">
        {Object.values(marks)
          .reduce((sum, val) => sum + (parseFloat(val) || 0), 0)}
      </span>
    </div>
  </div>
)}

      </div>

    </div>
  );
}

export default VideoScreen;