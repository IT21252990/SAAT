import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { storage } from "../../firebase";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import Header from "../../components/Header.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";
// import { ref as dbRef, onValue, set } from 'firebase/database';

function UploadVideo({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { assignmentId } = useParams();
  const location = useLocation();
  const { moduleId, moduleName } = location.state || {};
  const userId = localStorage.getItem("userId");
  const {showToast} = useToast();

  const handleUpload = () => {
    if (!file) {
      showToast("Please select a video file." , "warning");
      return;
    }
    let fnam = file.name.split(".");

    if (fnam.length > 2) {
      showToast('Upload video with a valid name example "text.mp4"', "warning");
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
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-100 dark:bg-gray-900">
        <h2 className="mb-10 text-5xl font-bold text-gray-900 dark:text-white">
          Upload Video Assignment
        </h2>
        <div className="inline-block p-10 text-center bg-white border border-gray-200 rounded-lg shadow-md dark:border-gray-600 dark:bg-gray-700">
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
            className="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
          />
          {file && (
            <div className="mb-5 text-gray-600 dark:text-gray-300">
              <p>Selected file: {file.name}</p>
            </div>
          )}
          {uploadProgress > 0 && (
            <div className="w-full h-5 mb-5 bg-gray-200 rounded-full dark:bg-gray-700">
              <div
                style={{ width: `${uploadProgress}%` }}
                className="h-full transition-all duration-500 bg-indigo-600 rounded-full"
              ></div>
            </div>
          )}
          <button
            onClick={handleUpload}
            className="px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-800"
          >
            Upload and Process
          </button>
        </div>
      </div>
    </>
  );
}

export default UploadVideo;
