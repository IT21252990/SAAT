import React, { useState } from "react";
import { FaSitemap, FaSearch, FaCodeBranch, FaPuzzlePiece, FaHome } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import { FaFileSignature } from "react-icons/fa6";
import { RiAccountPinCircleFill } from "react-icons/ri";
import RepoExplorer from "../components/RepoExplorer"; // Import your RepoExplorer component
import "../index.css"; // Include custom CSS if needed

const Home = ({repoUrl, repoData}) => {
  const [activeSection, setActiveSection] = useState("explorer");

  const renderActiveSection = () => {
    switch (activeSection) {
      case "explorer":
        return <RepoExplorer repoUrl={repoUrl}/>;
      case "search":
        return <div>search section</div>
      case "sourceControl":
        return <div>search section</div>
      case "extensions":
        return <div>search section</div>
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "60px",
          backgroundColor: "#1e1e1e",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "10px",
        }}
      >
        <SidebarIcon
          icon={<FaSitemap size={24}/>}
          label="Explorer"
          active={activeSection === "explorer"}
          onClick={() => setActiveSection("explorer")}
        />
        <SidebarIcon
          icon={<FaSearch size={24}/>}
          label="Search"
          active={activeSection === "search"}
          onClick={() => setActiveSection("search")}
        />
        <SidebarIcon
          icon={<FaFileSignature size={24}/>}
          label="Source Control"
          active={activeSection === "sourceControl"}
          onClick={() => setActiveSection("sourceControl")}
        />
        <SidebarIcon
          icon={<MdFeedback size={24}/>}
          label="Extensions"
          active={activeSection === "extensions"}
          onClick={() => setActiveSection("extensions")}
        />
        <SidebarIcon
          icon={<FaHome size={24}/>}
          label="Extensions"
          active={activeSection === "extensions"}
          onClick={() => setActiveSection("extensions")}
        />
        <SidebarIcon
          icon={<RiAccountPinCircleFill size={24}/>}
          label="Extensions"
          active={activeSection === "extensions"}
          onClick={() => setActiveSection("extensions")}
        />
      </div>

      {/* Main Content */}
      <div style={{ flex: 1 }}>{renderActiveSection()}</div>
    </div>
  );
};

const SidebarIcon = ({ icon, label, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "10px",
        cursor: "pointer",
        backgroundColor: active ? "#0078d4" : "transparent",
        borderRadius: "10px",
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

export default Home;
