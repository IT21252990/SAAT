import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSitemap,
  FaSearch,
  FaCodeBranch,
  FaPuzzlePiece,
  FaHome,
} from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import { FaFileSignature } from "react-icons/fa6";
import { RiAccountPinCircleFill } from "react-icons/ri";
import RepoExplorer from "../../components/RepoExplorer";
import LocalFileExplorer from "../../components/LocalFileExplorer";
import ContributorCommitHistory from "../../components/ContributorCommitHistory";
import Header from "../../components/Header";

const ViewCodeSubmission = () => {
  const [activeSection, setActiveSection] = useState("explorer");
  const navigate = useNavigate(); // Initialize useNavigate
  const { state } = useLocation(); // Get the state passed via navigate
  const { githubUrl, repoDetails } = state || {};

  const renderActiveSection = () => {
    switch (activeSection) {
      case "explorer": {
        if (githubUrl) {
          return <RepoExplorer repoUrl={githubUrl} />;
        }
        if (!githubUrl) {
          //   return <LocalFileExplorer/>
        }
      }
      case "contributions":
        return <ContributorCommitHistory repoUrl={githubUrl} />;
      case "extensions":
        return <div>search section</div>;
      default:
        return null;
    }
  };

  const handleHomeClick = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen max-w-full flex-col">
      <div className="flex-none">
        <Header />
      </div>
      <div className="flex-grow bg-gray-50 dark:bg-gray-900">
        <div style={{ display: "flex", height: "100vh" }}>
          {/* Sidebar */}
          <div
            style={{
              width: "60px",
              backgroundColor: "#1e1e1e",
              color: "#fff",
              marginRight: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "10px",
              paddingRight: "10px",
              justifyContent: "space-between", // Push content to the top and bottom
              height: "100%", // Ensure it spans full height
            }}
          >
            <div>
              <SidebarIcon
                icon={<FaSitemap size={24} />}
                label="Explorer"
                active={activeSection === "explorer"}
                onClick={() => setActiveSection("explorer")}
              />
              <SidebarIcon
                icon={<FaFileSignature size={24} />}
                label="Contributions"
                active={activeSection === "contributions"}
                onClick={() => setActiveSection("contributions")}
              />
              <SidebarIcon
                icon={<MdFeedback size={24} />}
                label="Extensions"
                active={activeSection === "extensions"}
                onClick={() => setActiveSection("extensions")}
              />
            </div>

            <div>
              {/* Home Icon */}
              <SidebarIcon
                icon={<FaHome size={24} />}
                label="Back to Students Submissions"
                active={activeSection === "Home"}
                onClick={handleHomeClick}
              />
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1 }}>{renderActiveSection()}</div>
        </div>
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon, label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px",
        paddingRight: "18px",
        cursor: "pointer",
        backgroundColor: active ? "#0078d4" : "transparent",
        borderRadius: "0px 25px 25px 0px",
        marginBottom: "10px",
        width: "100%",
        textAlign: "center",
        transition: "background-color 0.3s ease",
      }}
      title={label} // Tooltip for accessibility
    >
      {icon}
    </div>
  );
};

export default ViewCodeSubmission;
