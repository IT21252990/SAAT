import React, { useState } from "react";
import { ref as dbRef, onValue } from "firebase/database"; // Added 'off' import
import UploadVideo from "./UploadVideo";
import ProcessingScreen from "./ProcessingScreen";
import { database } from "../../firebase";
import { firestore } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

const pub_url = "https://5b00-34-124-255-253.ngrok-free.app";

function SubmitVideo() {
  const [videoURL, setVideoURL] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fileName, setFileName] = useState(""); // Added to track filename
  const navigate = useNavigate();
  const location = useLocation();
  const { moduleId, moduleName } = location.state || {};

  const formatVideoFileName = async (fileName) => {
    // Remove the file extension
    let nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    let formattedName = nameWithoutExtension.replace(/\s+/g, "_");
    formattedName = formattedName.replace(/[.#\$\[\]\/]/g, "_");
    return formattedName;
  };

  const processVideo = async (
    f_url,
    filename,
    assignmentId,
    moduleId,
    userId,
  ) => {
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
          userId: userId,
          video_url: f_url,
        }),
      });

      const progressRef = dbRef(
        database,
        `processing_status/${formattedFileName}`,
      );
      onValue(
        progressRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            console.log(data);
            setProcessingProgress(data);

            // Check if processing is complete
            if (data === 100) {
              setTimeout(() => {
                // Your code to execute after 5 seconds
              }, 5000);
              handleProcessingComplete(
                filename,
                assignmentId,
                moduleId,
                userId,
              );
            }
          }
        },
        (error) => {
          console.error("Error subscribing to database updates:", error);
        },
      );

      console.log("Success:");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchDocumentId = async (filename, assignmentId, moduleId, userId) => {
    try {
      console.log("Query Parameters:", {
        filename,
        assignmentId,
        moduleId,
        userId,
      });

      const videosCollection = collection(firestore, "videos");

      const q = query(
        videosCollection,
        where("assignmentId", "==", assignmentId),
        where("moduleId", "==", moduleId),
        where("userId", "==", userId),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const documentId = doc.id;
        console.log("Document ID:", documentId);
        return documentId;
      } else {
        console.log("No matching document found.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching document ID:", error);
      return null;
    }
  };

  const handleProcessingComplete = async (
    formattedFileName,
    assignmentId,
    moduleId,
    userId,
  ) => {
    const documentId = await fetchDocumentId(
      formattedFileName,
      assignmentId,
      moduleId,
      userId,
    );
    if (documentId) {
      // Retrieve existing data for the assignmentId, if any
      const existingData = JSON.parse(localStorage.getItem(assignmentId)) || {};

      // Update the data with the new videoDocId
      const updatedData = {
        ...existingData,
        videoDocId: documentId,
        // Add other variables like githubUrl and reportId as needed
        githubUrl: existingData.githubUrl || "", // Placeholder value
        reportId: existingData.reportId || "", // Placeholder value
      };

      // Store the updated data back in localStorage
      localStorage.setItem(assignmentId, JSON.stringify(updatedData));

      // Navigate to AddSubmissionPage
      navigate(`/add-submission/${assignmentId}`, {
        state: { moduleId, moduleName },
      });
    }
  };

  return (
    <div>
      { !videoURL && <UploadVideo onUploadComplete={processVideo} />}
      { videoURL && processingProgress < 100 && (
        <ProcessingScreen progress={processingProgress} />
      )}
    </div>
  );
}

export default SubmitVideo;
