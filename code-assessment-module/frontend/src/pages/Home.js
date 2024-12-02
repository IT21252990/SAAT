import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaSitemap, FaSearch, FaCodeBranch, FaPuzzlePiece, FaHome } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import { FaFileSignature } from "react-icons/fa6";
import { RiAccountPinCircleFill } from "react-icons/ri";
import RepoExplorer from "../components/RepoExplorer"; 
import LocalFileExplorer from "../components/LocalFileExplorer";
import "../index.css";

const Home = ({repoUrl, repoData}) => {
  const [activeSection, setActiveSection] = useState("explorer");
  const navigate = useNavigate(); // Initialize useNavigate

  const renderActiveSection = () => {
    switch (activeSection) {
      case "explorer":{
         if(repoUrl){
          return <RepoExplorer repoUrl={repoUrl}/> 
        }if(!repoUrl){
          return <LocalFileExplorer/>
        }
      }
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

  const handleHomeClick = () => {
    navigate("/students-submissions"); // Navigate to the students submission page
  };

  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile page
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "60px",
          backgroundColor: "#1e1e1e",
          color: "#fff",
          marginRight:"10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "10px",
          paddingRight:"10px",
          justifyContent: "space-between", // Push content to the top and bottom
          height: "100%", // Ensure it spans full height
        }}
      >
        <div>
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
        </div>

        <div>
          {/* Home Icon */}
          <SidebarIcon
            icon={<FaHome size={24}/>}
            label="Home"
            active={activeSection === "Home"}
            onClick={handleHomeClick}
          />
          {/* Profile Icon */}
          <SidebarIcon
            icon={<RiAccountPinCircleFill size={24}/>}
            label="Profile"
            active={activeSection === "profile"}
            onClick={handleProfileClick}
          />
        </div>
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

export default Home;
