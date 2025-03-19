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
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

function VideoScreen() {
  // Hardcoded video URL and filename
  const location = useLocation();
  const { videoId } = location.state;
  const [filename, setFilename] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const playerRef = useRef(null);
  const isTeacher = true;

  // State for segments (from the video document), active tab, comments, and comment input
  const [segments, setSegments] = useState([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  // Function to fetch the document ID for the video from the "videos" collection
  // const fetchDocumentId = async (video_url, filename) => {
  //   try {
  //     const videosCollection = collection(firestore, "videos");
  //     const q = query(
  //       videosCollection,
  //       where("videoId", "==", video_url),
  //       where("filename", "==", filename),
  //     );
  //     const querySnapshot = await getDocs(q);
  //     if (!querySnapshot.empty) {
  //       const docSnap = querySnapshot.docs[0];
  //       const documentId = docSnap.id;
  //       console.log("Document ID:", documentId);
  //       return documentId;
  //     } else {
  //       console.log("No matching document found.");
  //       return null;
  //     }
  //   } catch (error) {
  //     console.error("Error fetching document ID:", error);
  //     return null;
  //   }
  // };

  // useEffect to subscribe to the video document and fetch its segments
  useEffect(() => {
    const fetchVideoData = async () => {
      // const documentId = await fetchDocumentId(video_url, filename);
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
        if (data.videoId === videoId) 
          {loadedComments.push({ id: doc.id, ...data });}
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
    <div style={styles.container}>
      <h2 style={{ color: "blue" }}>Video Analysis Result</h2>
      <h3 style={{ color: "blue" }}>{filename}</h3>
      <div style={styles.playerWrapper}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          controls
          width="50%"
          height="50%"
          onError={(e) => console.error("ReactPlayer Error:", e)}
        />
      </div>

      {/** Tabbed Interface for Segments */}
      <div style={styles.tabContainer}>
        {segments.map((segment, index) => (
          <button
            key={index}
            style={{
              ...styles.tabButton,
              backgroundColor: index === activeSegmentIndex ? "#ddd" : "#fff",
            }}
            onClick={() => handleSegmentClick(index)}
          >
            {trepl(segment.type)} ({parseInt(segment.start)}s -{" "}
            {parseInt(segment.end)}s)
          </button>
        ))}
      </div>

      {/** Display Active Segment Text */}
      <div style={styles.textContainer}>
        <h3>Extracted Text:</h3>
        <p>{segments[activeSegmentIndex]?.text}</p>
      </div>

      {segments[activeSegmentIndex]?.functions && (
        <div style={styles.textContainer}>
          <h3>Extracted Codes/IDE settings:</h3>
          <p>
            {segments[activeSegmentIndex]?.functions
              ?.flatMap((item) => extractFunctionNames(item))
              .join(", ")}
          </p>
        </div>
      )}

      {/** Comments Section */}
      <div style={styles.commentSection}>
        <h3>Comments</h3>
        <div style={styles.commentList}>
          {comments.map((com) => (
            <div
              key={com.id}
              style={styles.commentItem}
              onClick={() => handleCommentClick(com.timestamp)}
            >
              <strong>{formatTime(com.timestamp)} :</strong> {com.text}
            </div>
          ))}
        </div>
      </div>
      {isTeacher && (
        <div style={styles.commentForm}>
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment"
            style={styles.commentInput}
          />
          <button onClick={handleAddComment} style={styles.commentButton}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to format time (mm:ss)
function formatTime(seconds) {
  const mm = Math.floor(seconds / 60);
  const ss = Math.floor(seconds % 60);
  return `${mm}:${ss < 10 ? "0" : ""}${ss}`;
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "50px",
  },
  playerWrapper: {
    position: "relative",
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center",
    alignItem: "center",
  },
  tabContainer: {
    marginBottom: "20px",
  },
  tabButton: {
    marginRight: "10px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  textContainer: {
    width: "80%",
    margin: "0 auto",
    textAlign: "left",
  },
  commentSection: {
    width: "80%",
    margin: "20px auto",
    textAlign: "left",
    borderTop: "1px solid #ccc",
    paddingTop: "20px",
  },
  commentList: {
    maxHeight: "150px",
    overflowY: "auto",
    marginBottom: "20px",
    border: "1px solid #ddd",
    padding: "10px",
  },
  commentItem: {
    display: "block",
    color: "#007bff",
    textDecoration: "none",
    padding: "5px 0",
    border: "1px solid #ddd",
  },
  commentForm: {
    display: "flex",
    gap: "10px",
  },
  commentInput: {
    flex: 1,
    padding: "6px",
  },
  commentButton: {
    padding: "6px 12px",
    cursor: "pointer",
  },
};

export default VideoScreen;
