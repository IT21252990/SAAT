import React, { useState, useEffect } from "react";
import { storage } from "../../firebase";
import { ref as storageRef, listAll, getDownloadURL } from "firebase/storage";
import "./VideoList.css";

function VideoList({ onVideoSelect }) {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosRef = storageRef(storage, "videos/");
        const res = await listAll(videosRef);

        const videoData = await Promise.all(
          res.items.map(async (item) => ({
            name: item.name,
            url: await getDownloadURL(item),
          }))
        );

        setVideos(videoData);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  const handleVideoHover = (e) => {
    const video = e.target;
    video.currentTime = 2; // Set to 2nd second
    video.muted = true;
  };

  return (
    <div className="video-list-container">
      <h1 className="uploaded-assignments-heading">Uploaded Assignments</h1>
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.name} className="video-card">
            <div className="video-preview-container">
              <video
                className="video-preview"
                muted
                onLoadedMetadata={handleVideoHover}
                onMouseEnter={handleVideoHover}
                onClick={(e) => e.preventDefault()}
              >
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div
                className="video-overlay"
                onClick={(e) => e.preventDefault()}
              >
                <button
                  className="view-button"
                  onClick={() => onVideoSelect(video.url, video.name)}
                >
                  View Analysis
                </button>
              </div>
            </div>
            <h3 className="video-title">
              {video.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VideoList;