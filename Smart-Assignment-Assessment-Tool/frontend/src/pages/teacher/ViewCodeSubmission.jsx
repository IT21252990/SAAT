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
  const navigate = useNavigate();
  const { state } = useLocation();
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
    <div className="flex h-screen w-full flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none">
        <Header />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="flex h-full w-16 flex-col justify-between bg-gray-600 dark:bg-gray-950 py-4 px-2">
          <div className="flex flex-col items-center space-y-2">
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

          <div className="flex flex-col items-center">
            <SidebarIcon
              icon={<FaHome size={24} />}
              label="Back to Students Submissions"
              active={false}
              onClick={handleHomeClick}
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-4">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon, label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-center rounded-r-3xl px-3 py-3 transition-all duration-300 hover:bg-primary-800 ${
        active ? "bg-primary-700" : "bg-transparent"
      }`}
      title={label}
    >
      <div className="text-white">{icon}</div>
    </div>
  );
};

export default ViewCodeSubmission;