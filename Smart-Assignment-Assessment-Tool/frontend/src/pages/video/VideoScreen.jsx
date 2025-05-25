import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactPlayer from "react-player";
import { firestore, auth } from "../../firebase"; // your Firebase initialization file
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

function VideoScreen() {
  const location = useLocation();
  const { videoId, assignmentId, submissionId } = location.state || {};

  const [filename, setFilename] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoUserId, setVideoUserId] = useState("");

  const playerRef = useRef(null);
  const [isTeacher, setIsTeacher] = useState(false);

  // segments (video transcription segments)
  const [segments, setSegments] = useState([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  // comments on this video
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  
  const [markingScheme, setMarkingScheme] = useState(null);
  const [marks, setMarks] = useState({});
  const [marksLoaded, setMarksLoaded] = useState(false);
  const [marksDocId, setMarksDocId] = useState(null);

  const handleUser = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const user = auth.currentUser;
      if (!user) {
        console.error("User is not authenticated");
        return;
      }

      console.log("📡 Fetching user role for userId:", userId);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/getUser/${userId}`
      );
      const data = await response.json();
      console.log("🚩 Received role data:", data);

      if (data.role === "teacher") {
        setIsTeacher(true);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    handleUser();

    if (!videoId) return;
    const videoDocRef = doc(firestore, "videos", videoId);
    const unsubscribe = onSnapshot(videoDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFilename(data.filename || "");
        setVideoUrl(data.video_url || "");
        setSegments(data.segments || []);
        setVideoUserId(data.userId || "");
      } else {
        console.log("Video document does not exist");
      }
    });

    return () => unsubscribe();
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;
    const q = query(
      collection(firestore, "videoComments"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.videoId === videoId) {
          loadedComments.push({ id: doc.id, ...data });
        }
      });
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [videoId]);

  useEffect(() => {
    if (!assignmentId) return;

    const fetchScheme = async () => {
      console.log("📡 Fetching marking scheme for assignmentId:", assignmentId);
      try {
        const schemesRef = collection(firestore, "marking_schemes");
        const q = query(
          schemesRef,
          where("assignment_id", "==", assignmentId)
        );
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
          const docSnap = querySnap.docs[0];
          const data = docSnap.data();
          console.log("✅ Marking scheme doc data:", data);
          setMarkingScheme({ id: docSnap.id, ...data });

          // Initialize marks state with empty strings for each criterion
          const videoArr = data.criteria?.video || [];
          const initialMarks = {};
          videoArr.forEach((c) => {
            initialMarks[c.criterion] = "";
          });
          setMarks(initialMarks);
        } else {
          console.warn(
            `⚠️ No marking scheme found for assignmentId: ${assignmentId}`
          );
          setMarkingScheme(null);
        }
      } catch (err) {
        console.error("Error fetching marking scheme:", err);
        setMarkingScheme(null);
      }
    };

    fetchScheme();
  }, [assignmentId]);

  useEffect(() => {
    const fetchExistingMarks = async () => {
      if (
        !markingScheme ||
        !videoId ||
        !submissionId ||
        !videoUserId ||
        marksLoaded
      ) {
        return;
      }

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
          // Assume only one document per assignment/video/submission/user
          const docSnap = querySnap.docs[0];
          const stored = docSnap.data().marks || {};
          console.log("📥 Loaded existing marks:", stored);

          // Save the Firestore doc ID so we can update later
          setMarksDocId(docSnap.id);

          // Ensure we keep all criteria keys: if some criterion missing, default to ""
          const videoArr = markingScheme.criteria?.video || [];
          const updatedMarks = {};
          videoArr.forEach((c) => {
            const crit = c.criterion;
            updatedMarks[crit] =
              stored[crit] !== undefined ? String(stored[crit]) : "";
          });
          setMarks(updatedMarks);
        } else {
          console.log("ℹ️ No existing marks document found");
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
        videoId: videoId,
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
    if (!commentInput.trim() || !playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    await addCommentToFirestore(commentInput.trim(), currentTime);
    setCommentInput("");
  };

  const handleCommentClick = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, "seconds");
    }
  };

  const handleProgress = (state) => {
    const currentTime = state.playedSeconds;
    const currentSegmentIndex = segments.findIndex(
      (segment) =>
        currentTime >= segment.start && currentTime <= segment.end
    );
    if (
      currentSegmentIndex !== -1 &&
      currentSegmentIndex !== activeSegmentIndex
    ) {
      setActiveSegmentIndex(currentSegmentIndex);
    }
  };

  const handleMarkChange = (criterion, value) => {
    if (!isTeacher) return;
    // Only accept digits or blank
    if (/^\d*$/.test(value)) {
      setMarks((prev) => {
        const updated = { ...prev, [criterion]: value };
        console.log(`✏️ Updated marks state:`, updated);
        return updated;
      });
    }
  };

  const handleSaveMarks = async () => {
    if (!markingScheme) return;

    // 1) VALIDATE each criterion has a numeric value
    const videoArr = markingScheme.criteria?.video || [];
    for (let critObj of videoArr) {
      const crit = critObj.criterion;
      const val = marks[crit];
      if (val === "" || isNaN(Number(val))) {
        alert(`Please enter a valid numeric mark for "${crit}"`);
        return;
      }
    }

    // 2) Build the common payload (we’ll omit createdAt on update)
    const newMarksObject = {};
    Object.entries(marks).forEach(([crit, strValue]) => {
      newMarksObject[crit] = Number(strValue);
    });

    // 3) If marksDocId exists, update that doc; otherwise, add new doc
    if (marksDocId) {
      console.log(
        `🔄 Updating existing marks doc (ID: ${marksDocId}) with:`,
        newMarksObject
      );
      try {
        const docRef = doc(firestore, "video_marks", marksDocId);
        await updateDoc(docRef, {
          marks: newMarksObject,
          updatedAt: serverTimestamp(),
        });
        console.log("✅ Marks updated successfully!");
        alert("Marks updated successfully!");
      } catch (err) {
        console.error("❌ Error updating video marks:", err);
        alert("Failed to update marks. Check console for details.");
      }
    } else {
      console.log("📤 Creating a new marks document with:", newMarksObject);
      try {
        await addDoc(collection(firestore, "video_marks"), {
          assignmentId: assignmentId,
          userId: videoUserId,
          submissionId: submissionId,
          videoId: videoId,
          marks: newMarksObject,
          createdAt: serverTimestamp(),
        });
        console.log("✅ Marks saved successfully!");
        alert("Marks saved successfully!");
      } catch (err) {
        console.error("❌ Error saving video marks:", err);
        alert("Failed to save marks. Check console for details.");
      }
    }
  };

  return (
    <div className="flex h-full flex-col items-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <div className="mt-12 w-full max-w-7xl rounded-xl border border-gray-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800">
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* TITLE + FILENAME */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <h2 className="mb-2 text-3xl font-bold text-gray-800 dark:text-white">
          Video Analysis & Marking
        </h2>
        <h3 className="mb-6 text-xl font-medium text-gray-600 dark:text-gray-300">
          {filename}
        </h3>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* VIDEO PLAYER */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
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

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* SEGMENT NAVIGATION */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
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
              {segment.type === "Code" ? "Codes" : "Normal"} (
              {parseInt(segment.start)}s - {parseInt(segment.end)}s)
            </button>
          ))}
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* DISPLAY ACTIVE SEGMENT TEXT */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        <div className="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
          <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
            Extracted Text
          </h3>
          <p className="text-gray-700 dark:text-gray-200">
            {segments[activeSegmentIndex]?.text ||
              "No text available for this segment"}
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* EXTRACTED CODES / IDE SETTINGS */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {segments[activeSegmentIndex]?.functions && (
          <div className="mb-6 rounded-lg bg-gray-50 p-6 dark:bg-gray-700">
            <h3 className="mb-3 text-xl font-semibold text-gray-800 dark:text-white">
              Extracted Codes/IDE Settings
            </h3>
            <p className="text-gray-700 dark:text-gray-200">
              {segments[activeSegmentIndex]
                ?.functions?.flatMap((item) =>
                  extractFunctionNames(item)
                )
                .join(", ") || "No code elements detected"}
            </p>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* COMMENTS SECTION */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
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

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* COMMENT INPUT FOR TEACHER */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
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
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={!commentInput.trim()}
            >
              Comment
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────────── */}
        {/* MARKING SCHEME & MARKS SECTION */}
        {/* Only show if there are video criteria */}
        {/* ─────────────────────────────────────────────────────────────────────── */}
        {(markingScheme?.criteria?.video?.length ?? 0) > 0 && (
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
                <div
                  key={idx}
                  className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-700"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-medium text-gray-800 dark:text-white">
                      {criterion} ({weightage}%)
                    </h4>
                    <input
                      type="text"
                      value={marks[criterion] || ""}
                      onChange={(e) =>
                        handleMarkChange(criterion, e.target.value)
                      }
                      placeholder={`Enter mark (max ${type_weight})`}
                      disabled={!isTeacher}
                      className={`w-24 rounded border px-2 py-1 focus:outline-none ${
                        isTeacher
                          ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-600"
                          : "border-gray-200 bg-gray-200 text-gray-600 cursor-not-allowed"
                      }`}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>High:</strong> {high_description} &nbsp;|&nbsp;{" "}
                    <strong>Med:</strong> {medium_description} &nbsp;|&nbsp;{" "}
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
      </div>
    </div>
  );
}

function formatTime(seconds) {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss < 10 ? "0" : ""}${ss}`;
}

function combineNonEmptyArrays(obj) {
  return Object.values(obj)
    .filter((value) => Array.isArray(value) && value.length > 0)
    .flat();
}

const extractFunctionNames = (jsonString) => {
  const cleaned = jsonString.replace(/```[a-z]*\s*|\s*```/g, "");
  const trimmed = cleaned.trim();

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

export default VideoScreen;
