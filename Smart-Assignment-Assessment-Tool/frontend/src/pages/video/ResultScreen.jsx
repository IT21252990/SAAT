import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
// Import your Firebase functions
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

function ResultScreen({ videoURL, fileName, onback, isTeacher }) {
  // 'segments' is assumed to be an array of objects with:
  //  { start: number, end: number, type: string, text: string }

  const playerRef = useRef(null);
  isTeacher=true;

  // Active tab (index of the segment)
  const [segments, setSegments] = useState([]);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    // If no fileName, do nothing
    if (!fileName) return;

    // Remove extension from fileName to get doc name
    const fileNameWithoutExt = fileName.split(".")[0];

    // Reference to that doc in 'videoSegments' collection
    const docRef = doc(firestore, "segments", fileNameWithoutExt);

    // Listen in real-time
    const unsubscribeSegments = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Expecting data.segments to be an array
        setSegments(data.segments || []);
        console.log(data.segments);
      } else {
        console.log("No segments doc found for: ", fileNameWithoutExt);
        setSegments([]);
      }
    });

    return () => unsubscribeSegments();
  }, [fileName]);

  // Fetch comments in real-time (sorted by timestamp ascending)
  useEffect(() => {
    if (!fileName) return;
    const q = query(
      collection(firestore, "videoComments"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedComments = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only add comments for this specific file/video
        if (data.videoName === fileName) {
          loadedComments.push({ id: doc.id, ...data });
        }
      });
      setComments(loadedComments);
    });
    return () => unsubscribe();
  }, [fileName]);

  // Function to create a new comment in Firestore
  async function addCommentToFirestore(commentText, time) {
    try {
      await addDoc(collection(firestore, "videoComments"), {
        videoName: fileName,
        text: commentText,
        timestamp: time,
        createdAt: new Date(), // or serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding comment: ", error);
    }
  }

  // -------------------------------
  // Handlers
  // -------------------------------

  // Handle changing tabs (when user clicks a segment)
  const handleSegmentClick = (index) => {
    setActiveSegmentIndex(index);
    if (playerRef.current) {
      // Jump to the start time of the selected segment
      playerRef.current.seekTo(segments[index].start, "seconds");
    }
  };

  // Handle comment submission
  const handleAddComment = async () => {
    if (!commentInput.trim() || !playerRef.current) return;

    const currentTime = playerRef.current.getCurrentTime();

    // Save to Firestore (uncomment if integrated)
    await addCommentToFirestore(commentInput.trim(), currentTime);

    // Clear the input
    setCommentInput("");
  };

  // Handle clicking on a comment to jump to its timestamp
  const handleCommentClick = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, "seconds");
    }
  };

  function combineNonEmptyArrays(obj) {
    return Object.values(obj) // Get all values
      .filter((value) => Array.isArray(value) && value.length > 0) // Keep only non-empty arrays
      .flat(); // Merge arrays
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
    if (text == "Code") {
      return "Codes";
    } else {
      return "Normal";
    }
  };

  return (
    <div style={styles.container}>
      <button
        style={{
          color: "blue",
          width: "100px",
          height: "50px",
          position: "fixed",
          top: "50px",
          left: "50px",
        }}
        onClick={() => onback()}
      >
        Back
      </button>
      <h2 style={{ color: "blue" }}>Video Analysis Result</h2>
      <h3 style={{ color: "blue" }}>{fileName}</h3>
      <div style={styles.playerWrapper}>
        {console.log(videoURL)}
        <ReactPlayer
          ref={playerRef}
          url={videoURL}
          controls
          width="50%"
          height="50%"
          onError={(e) => console.error("ReactPlayer Error:", e)}
        />
      </div>

      {/** TABBED INTERFACE FOR SEGMENTS */}
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

      {/** DISPLAY ACTIVE SEGMENT TEXT */}
      <div style={styles.textContainer}>
        <h3>Extracted Text:</h3>
        <p>{segments[activeSegmentIndex]?.text}</p>
      </div>

      {segments[activeSegmentIndex]?.functions && (
        <div style={styles.textContainer}>
          <h3>Extracted Codes/IDE settings:</h3>
          <p>
            {
              // Flatten all function names from each segment into a single array
              segments[activeSegmentIndex]?.functions
                ?.flatMap((item) => extractFunctionNames(item))
                .join(", ")
            }
          </p>
        </div>
      )}

      {/** COMMENTS SECTION */}
      
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

// Helper function to format time in a simplistic way (e.g., mm:ss)
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
    color: "#007bff", // Bootstrap link color
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

export default ResultScreen;