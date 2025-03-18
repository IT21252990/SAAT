import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { storage } from "../../firebase";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
// import { ref as dbRef, onValue, set } from 'firebase/database';

function UploadVideo({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { assignmentId } = useParams();
  const location = useLocation();
  const { moduleId, moduleName } = location.state || {};
  const userId = localStorage.getItem("userId");

  const handleUpload = () => {
    if (!file) {
      alert("Please select a video file.");
      return;
    }
    let fnam = file.name.split(".");

    if (fnam.lenght > 2) {
      alert('Upload video with a valid name example "text.mp4');
      return;
    }
    const storageReference = storageRef(storage, `videos/${file.name}`);
    const uploadTask = uploadBytesResumable(storageReference, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Update upload progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
      },
      () => {
        // Get the download URL after upload completes
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // *****studentID + filename for storing in database
          onUploadComplete(downloadURL, file.name, assignmentId, moduleId, userId);
        });
      }
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upload Video Assignment</h2>
      <div style={styles.formGroup}>
        <h4 style={{ fontWeight: "bold", fontSize: 25 }}>
          Please upload the Assignment to start processing
        </h4>
        <br />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setUploadProgress(0); // Reset upload progress
          }}
          style={styles.input}
        />
        {file && (
          <div style={styles.fileInfo}>
            <p>Selected file: {file.name}</p>
          </div>
        )}
        {uploadProgress > 0 && (
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progress,
                width: `${uploadProgress}%`,
              }}
            ></div>
          </div>
        )}
        <br />
        <button onClick={handleUpload} style={styles.button}>
          Upload and Process
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage:
      'url("https://plus.unsplash.com/premium_photo-1661456342021-faa4a2ac84f1?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZWR1Y2F0aW9uJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100vh",
    color: "#6200ee",
    textAlign: "center",
    padding: "0 20px",
  },
  heading: {
    color: "#fff",
    fontSize: "48px",
    marginBottom: "40px",
    textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
  },
  formGroup: {
    display: "inline-block",
    textAlign: "center",
    padding: "20px 60px 60px 60px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#f7f7f7",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
  },
  input: {
    marginBottom: "20px",
    fontSize: "16px",
    display: "block",
  },
  fileInfo: {
    marginBottom: "20px",
    color: "#555",
  },
  progressBar: {
    width: "100%",
    height: "20px",
    backgroundColor: "#e0e0e0",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "20px",
  },
  progress: {
    height: "100%",
    backgroundColor: "#6200ee",
    transition: "width 0.5s ease-in-out",
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#6200ee",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default UploadVideo;
