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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-6 dark:bg-gray-900">
      <h2 className="mb-10 text-5xl font-bold text-gray-900 dark:text-white">
        Upload Video Assignment
      </h2>
      <div className="inline-block rounded-lg border border-gray-200 bg-white p-10 text-center shadow-md dark:border-gray-600 dark:bg-gray-700">
        <h4 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Please upload the Assignment to start processing
        </h4>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setUploadProgress(0); // Reset upload progress
          }}
          className="mb-5 block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
        />
        {file && (
          <div className="mb-5 text-gray-600 dark:text-gray-300">
            <p>Selected file: {file.name}</p>
          </div>
        )}
        {uploadProgress > 0 && (
          <div className="mb-5 h-5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              style={{ width: `${uploadProgress}%` }}
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            ></div>
          </div>
        )}
        <button
          onClick={handleUpload}
          className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-800"
        >
          Upload and Process
        </button>
      </div>
    </div>
  );
}

export default UploadVideo;
