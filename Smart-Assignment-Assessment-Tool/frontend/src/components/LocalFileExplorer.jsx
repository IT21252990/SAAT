import React, { useEffect, useState } from "react";
import axios from "axios";
import { Editor } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import {
  FaJsSquare,
  FaPython,
  FaJava,
  FaHtml5,
  FaCss3Alt,
  FaFileAlt,
  FaCaretRight,
  FaCaretDown,
  FaTimes,
} from "react-icons/fa";
import "../index.css";
import "../styles/editor.styles.css";

const LocalFileExplorer = () => {
  const [contents, setContents] = useState({}); // Stores directory contents
  const [expandedNodes, setExpandedNodes] = useState(new Set()); // Tracks expanded nodes
  const [tabs, setTabs] = useState([]); // Opened tabs
  const [activeTab, setActiveTab] = useState(null); // Active tab
  const [fileContents, setFileContents] = useState({}); // File content cache
  const [language, setLanguage] = useState("plaintext"); // Language for Monaco Editor

  // Fetch root contents on mount
  useEffect(() => {
    const fetchRootContents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/file-upload/local-contents`,
          { params: { path: "" } }
        );
        setContents({ "": response.data });
      } catch (error) {
        console.error("Error fetching root contents:", error);
      }
    };
    fetchRootContents();
  }, []);

  // Fetch contents of a directory
  const fetchSubdirectoryContents = async (path) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/file-upload/local-contents`,
        { params: { path } }
      );
      setContents((prev) => ({ ...prev, [path]: response.data }));
    } catch (error) {
      console.error("Error fetching subdirectory contents:", error);
    }
  };

  // Render directory tree recursively
  const renderTree = (items = [], parentPath = "") => {
    return (
      <ul style={{ listStyleType: "none", marginLeft: "20px", padding: 0 }}>
        {items.map((item) => {
          const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;
          const isExpanded = expandedNodes.has(itemPath);

          return (
            <li key={itemPath}>
              {item.type === "dir" ? (
                <>
                  <span
                    onClick={() => toggleExpand(itemPath)}
                    style={{ cursor: "pointer", color: "blue", fontWeight: "bold" }}
                  >
                    {isExpanded ? <FaCaretDown /> : <FaCaretRight />} {item.name}
                  </span>
                  {isExpanded && renderTree(contents[itemPath], itemPath)}
                </>
              ) : (
                <span
                  onClick={() => handleFileClick(item)}
                  style={{
                    cursor: "pointer",
                    padding: "5px",
                    display: "inline-block",
                  }}
                >
                  <FaFileAlt /> {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  // Toggle folder expansion and fetch contents if needed
  const toggleExpand = (path) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(path)) {
        newExpanded.delete(path); // Collapse
      } else {
        newExpanded.add(path); // Expand
        if (!contents[path]) fetchSubdirectoryContents(path); // Fetch if not already loaded
      }
      return newExpanded;
    });
  };

  // Handle file click to open in a tab
  const handleFileClick = async (item) => {
    if (!tabs.find((tab) => tab.path === item.path)) {
      setTabs((prev) => [...prev, { name: item.name, path: item.path }]);
    }
    setActiveTab(item);

    if (!fileContents[item.path]) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/file-upload/local-file-content`,
          { params: { path: item.path } }
        );
        setFileContents((prev) => ({
          ...prev,
          [item.path]: response.data.content,
        }));
        setLanguage(mapExtensionToLanguage(item.name.split(".").pop()));
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    }
  };

  // Map file extension to Monaco Editor language
  const mapExtensionToLanguage = (extension) => ({
    js: "javascript",
    py: "python",
    java: "java",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    txt: "plaintext",
  }[extension] || "plaintext");

  // Close a tab
  const closeTab = (tabToClose) => {
    setTabs((prev) => prev.filter((tab) => tab.path !== tabToClose.path));
    if (activeTab?.path === tabToClose.path) {
      setActiveTab(tabs.find((tab) => tab.path !== tabToClose.path) || null);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar for file tree */}
      <div style={{ width: "300px", overflowY: "auto", padding: "10px", borderRight: "1px solid #ccc" }}>
        <h2>Repo Explorer</h2>
        {renderTree(contents[""], "")}
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, padding: "10px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: "10px", gap: "5px" }}>
          {tabs.map((tab) => (
            <div
              key={tab.path}
              style={{
                padding: "5px 10px",
                backgroundColor: activeTab?.path === tab.path ? "#007bff" : "#f1f1f1",
                color: activeTab?.path === tab.path ? "#fff" : "#000",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.name}
              <FaTimes
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab);
                }}
                style={{ marginLeft: "10px", cursor: "pointer" }}
              />
            </div>
          ))}
        </div>

        {/* Editor */}
        {activeTab && (
          <Editor
            height="90vh"
            theme="vs-dark"
            language={language}
            value={fileContents[activeTab.path]}
            options={{
              readOnly: true,
              fontSize: 14,
              minimap: { enabled: true },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LocalFileExplorer;
