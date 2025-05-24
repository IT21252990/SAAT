import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSitemap,
  FaSearch,
  FaCodeBranch,
  FaPuzzlePiece,
  FaHome,
  FaFileInvoice,
  FaChartLine,
  FaHandshake
} from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import { FaFileSignature } from "react-icons/fa6";
import { RiAccountPinCircleFill } from "react-icons/ri";
import RepoExplorer from "../../components/code/RepoExplorer";
import LocalFileExplorer from "../../components/code/LocalFileExplorer";
import ContributorCommitHistory from "../../components/code/ContributorCommitHistory";
import DisplayAssignmentDetails from "../../components/code/DisplayAssignmentDetails";
import DisplayCodeComments from "../../components/code/DisplayCodeComments";
import RepositoryAnalyzer from "../../components/code/RepositoryAnalyzer";
import CodeAnalysisResults from "../../components/code/CodeAnalysisResults";
import Header from "../../components/Header";

const ViewCodeSubmission = () => {
  const [activeSection, setActiveSection] = useState("explorer");
  const navigate = useNavigate();
  const { state } = useLocation();
  const { githubUrl, repoDetails, submissionId, codeId } = state || {};

  const renderActiveSection = () => {
    switch (activeSection) {
      case "explorer": {
        if (githubUrl) {
          return <RepoExplorer repoUrl={githubUrl} codeId={codeId} />;
        }
        if (!githubUrl) {
          //   return <LocalFileExplorer/>
        }
      }
      case "contributions":
        return <ContributorCommitHistory repoUrl={githubUrl} />;
      case "Comments":
        return <DisplayCodeComments codeId={codeId}/>
      case "analyze_code_base":
        return <RepositoryAnalyzer github_url={githubUrl} code_id={codeId}/>
      case "code_analysis_results":
        return <CodeAnalysisResults codeId={codeId} submission_id={submissionId}/>
      case "submission_details":
        return <DisplayAssignmentDetails submission_id={submissionId} />
      default:
        return null;
    }
  };

  const handleHomeClick = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-none">
        <Header />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="flex flex-col justify-between w-16 h-full px-2 py-4 bg-gray-600 dark:bg-gray-950">
          <div className="flex flex-col items-center space-y-2">
            <SidebarIcon
              icon={<FaSitemap size={24} />}
              label="Explorer"
              active={activeSection === "explorer"}
              onClick={() => setActiveSection("explorer")}
            />
            <SidebarIcon
              icon={<FaHandshake size={24} />}
              label="Contributions"
              active={activeSection === "contributions"}
              onClick={() => setActiveSection("contributions")}
            />
            <SidebarIcon
              icon={<MdFeedback size={24} />}
              label="Comments"
              active={activeSection === "Comments"}
              onClick={() => setActiveSection("Comments")}
            />
            <SidebarIcon
              icon={<FaChartLine size={24} />}
              label="Repository Analysis Tools"
              active={activeSection === "analyze_code_base"}
              onClick={() => setActiveSection("analyze_code_base")}
            />
            <SidebarIcon
              icon={<FaFileInvoice size={24} />}
              label="Code Analysis Results"
              active={activeSection === "code_analysis_results"}
              onClick={() => setActiveSection("code_analysis_results")}
            />
          </div>

          <div className="flex flex-col items-center">
          <SidebarIcon
              icon={<FaFileSignature size={24} />}
              label="Submission Details"
              active={activeSection === "submission_details"}
              onClick={() => setActiveSection("submission_details")}
            />
            <SidebarIcon
              icon={<FaHome size={24} />}
              label="Back to Students Submissions"
              active={false}
              onClick={handleHomeClick}
            />
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 p-4 overflow-auto">
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