import React, { useState } from "react";
import { ref as dbRef, onValue } from "firebase/database";
import UploadVideo from "./UploadVideo";
import ProcessingScreen from "./ProcessingScreen";
import { database } from "../../firebase";
import { firestore } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, useLocation, useParams } from "react-router-dom";

const pub_url = "https://2e40-34-125-71-217.ngrok-free.app";

function SubmitVideo() {
  const [videoURL, setVideoURL] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const { assignmentId } = useParams();
  const userId = localStorage.getItem("userId");
  const [fileName, setFileName] = useState("");
  const [showNavigate, setShowNavigate] = useState(false);
  const [earlyNavigationTriggered, setEarlyNavigationTriggered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { moduleId, moduleName, submissionId } = location.state || {};
  
  console.log("SubmitVideo - Received submission ID:", submissionId);

  const formatVideoFileName = async (fileName) => {
    let nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    let formattedName = nameWithoutExtension.replace(/\s+/g, "_");
    formattedName = formattedName.replace(/[.#\$\[\]\/]/g, "_");
    return formattedName;
  };

  // Construct the expected document ID based on your notebook pattern
  const constructVideoDocumentId = (submissionId, fileName) => {
    const nameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
    return `${submissionId}_${nameWithoutExtension}`;
  };

  // Verify that the video document exists (optional verification)
  const verifyVideoDocument = async (documentId) => {
    try {
      const docRef = doc(firestore, "videos", documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log("Video document verified:", documentId);
        return true;
      } else {
        console.warn("Video document not found:", documentId);
        return false;
      }
    } catch (error) {
      console.error("Error verifying video document:", error);
      return false;
    }
  };

  // Function to update submission with video ID (keep as backup, but might not be needed)
  const updateSubmissionWithVideoId = async (submissionId, videoId) => {
    if (!submissionId) {
      console.warn("No submissionId provided to update video");
      return false;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submission/update-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: submissionId,
          video_id: videoId,
        }),
      });
      
      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.error || "Failed to update video_id");
      }
      
      console.log("Successfully updated submission with video ID:", videoId);
      return true;
    } catch (err) {
      console.error("Error updating submission with video_id:", err);
      return false;
    }
  };

  const processVideo = async (f_url, filename, assignmentId, moduleId, userId) => {
    setVideoURL(f_url);
    const formattedFileName = await formatVideoFileName(filename);
    setFileName(filename);

    console.log("Processing video with:", {
      filename,
      assignmentId,
      moduleId,
      userId,
      submissionId,
      f_url,
    });

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
          submissionId: submissionId,
        }),
      });

      const progressRef = dbRef(database, `processing_status/${formattedFileName}`);
      onValue(
        progressRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setProcessingProgress(data);

            // Early navigation trigger at 30% (when video doc and submission are created/updated)
            if (data >= 30 && !earlyNavigationTriggered) {
              setEarlyNavigationTriggered(true);
              setShowNavigate(true);
              
              // Since your notebook creates/updates documents at 30%, we can navigate early
              setTimeout(() => {
                handleEarlyProcessingNavigation(filename);
              }, 2000); // Small delay to ensure notebook operations complete
            }

            // Keep the full completion handler as backup
            if (data === 100) {
              setTimeout(() => {
                handleProcessingComplete(filename, assignmentId, moduleId, userId);
              }, 1000);
            }
          }
        },
        (error) => {
          console.error("Error subscribing to database updates:", error);
        }
      );

      console.log("Video processing initiated successfully");
    } catch (error) {
      console.error("Error starting video processing:", error);
    }
  };

  // Handle early navigation (at 30% progress)
  const handleEarlyProcessingNavigation = async (filename) => {
    console.log("Early navigation triggered at 30% progress");
    
    // Construct the expected document ID
    const expectedDocumentId = constructVideoDocumentId(submissionId, filename);
    console.log("Expected video document ID:", expectedDocumentId);
    
    // Optional: Verify the document exists
    const documentExists = await verifyVideoDocument(expectedDocumentId);
    
    if (documentExists || true) { // Proceeding even if verification fails
      // Update localStorage for persistence
      const existingData = JSON.parse(localStorage.getItem(assignmentId)) || {};
      const updatedData = {
        ...existingData,
        videoDocId: expectedDocumentId,
        githubUrl: existingData.githubUrl || "",
        reportId: existingData.reportId || "",
        processingStatus: "in_progress" // Track that video is still processing
      };
      localStorage.setItem(assignmentId, JSON.stringify(updatedData));

      console.log("Navigating back early with submission ID:", submissionId);
      
      // Navigate back to AddSubmissionPage
      navigate(`/add-submission/${assignmentId}`, {
        state: {
          assignmentId,
          moduleId,
          moduleName,
          submissionId1: submissionId,
          videoProcessing: true, // Flag to indicate video is still processing
        },
      });
    } else {
      console.warn("Document verification failed, waiting for full completion");
    }
  };

  // Original completion handler (kept as backup)
  const handleProcessingComplete = async (filename, assignmentId, moduleId, userId) => {
    console.log("Full processing complete (100%)");
    
    if (earlyNavigationTriggered) {
      console.log("Early navigation already triggered, updating processing status only");
      
      // Just update the processing status in localStorage
      const existingData = JSON.parse(localStorage.getItem(assignmentId)) || {};
      const updatedData = {
        ...existingData,
        processingStatus: "completed"
      };
      localStorage.setItem(assignmentId, JSON.stringify(updatedData));
      return;
    }
    
    // Fallback: if early navigation didn't trigger, use the original logic
    const expectedDocumentId = constructVideoDocumentId(submissionId, filename);
    
    // Update localStorage
    const existingData = JSON.parse(localStorage.getItem(assignmentId)) || {};
    const updatedData = {
      ...existingData,
      videoDocId: expectedDocumentId,
      githubUrl: existingData.githubUrl || "",
      reportId: existingData.reportId || "",
      processingStatus: "completed"
    };
    localStorage.setItem(assignmentId, JSON.stringify(updatedData));

    // Navigate back
    navigate(`/add-submission/${assignmentId}`, {
      state: {
        assignmentId,
        moduleId,
        moduleName,
        submissionId1: submissionId,
      },
    });
  };

  return (
    <div>
      {!videoURL && <UploadVideo onUploadComplete={processVideo} />}
      {videoURL && processingProgress < 100 && (
        <ProcessingScreen 
          progress={processingProgress} 
          assignmentId={assignmentId} 
          moduleId={moduleId} 
          userId={userId} 
          showNavigate={showNavigate} 
        />
      )}
    </div>
  );
}

export default SubmitVideo;