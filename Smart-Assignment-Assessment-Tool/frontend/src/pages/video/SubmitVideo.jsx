import React, { useState, useEffect } from "react";
import { ref as dbRef, onValue, off } from "firebase/database"; // Added 'off' import
import UploadVideo from "./UploadVideo";
import ProcessingScreen from "./ProcessingScreen";
import ResultScreen from "./ResultScreen";
import { database } from "../../firebase";
import VideoList from "./VideoList";

const pub_url = "https://1c84-34-141-150-237.ngrok-free.app";

function SubmitVideo() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [videoURL, setVideoURL] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fileName, setFileName] = useState(""); // Added to track filename
  const [isTeacher, setIsTeacher] = useState(false);


  const formatVideoFileName = async (fileName) => {
    // Remove the file extension
    let nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    let formattedName = nameWithoutExtension.replace(/\s+/g, "_");
    formattedName = formattedName.replace(/[.#\$\[\]\/]/g, "_");
    return formattedName;
  };

  const processVideo = async (f_url, filename, assignmentId, moduleId, userId) => {
    setVideoURL(f_url);

    const formattedFileName = await formatVideoFileName(filename);
    setFileName(filename); // Store filename for useEffect

    try {
      const response = await fetch(pub_url + "/process_video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: filename,
          assignmentId: assignmentId,
          moduleId: moduleId,
          userId: userId
        }),
      });

      const progressRef = dbRef(
        database,
        `processing_status/${formattedFileName}`
      );
      onValue(
        progressRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            console.log(data);
            setProcessingProgress(data);
          }
        },
        (error) => {
          console.error("Error subscribing to database updates:", error);
        }
      );

      console.log("Success:");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleVideoSelect = (url, name) => {
    setVideoURL(url);
    setFileName(name);
    setProcessingProgress(100);
  };

  const goback = () => {
    setVideoURL("");
    setProcessingProgress(0);
  };

  return (
    <div>
      {!videoURL && (
          <UploadVideo onUploadComplete={processVideo} />
      )}
      {isAuthenticated && videoURL && processingProgress < 100 && (
        <ProcessingScreen progress={processingProgress} />
      )}
      {isAuthenticated && videoURL && processingProgress === 100 && (
        <ResultScreen
          videoURL={videoURL}
          fileName={fileName}
          onback={goback}
          isTeacher={isTeacher}
        />
      )}
      <VideoList />
    </div>
  );
}

export default SubmitVideo;
