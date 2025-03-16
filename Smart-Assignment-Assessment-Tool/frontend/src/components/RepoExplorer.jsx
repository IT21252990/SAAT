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
  FaInfoCircle,
} from "react-icons/fa";
import "../index.css";
import "../styles/editor.styles.css";

const RepoExplorer = ({ repoUrl }) => {
  const [contents, setContents] = useState({});
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [language, setLanguage] = useState("plaintext");
  const [editorInstance, setEditorInstance] = useState(null);
  const [lineComments, setLineComments] = useState({});
  const [currentLine, setCurrentLine] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentPopup, setShowCommentPopup] = useState(false);

  useEffect(() => {
    const fetchRootContents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/repo/repo-contents`,
          { params: { repo_url: repoUrl } }
        );
        setContents((prev) => ({
          ...prev,
          "": response.data,
        }));
      } catch (error) {
        console.error("Error fetching repository contents:", error);
      }
    };
    fetchRootContents();
  }, [repoUrl]);

  const fetchSubdirectoryContents = async (itemPath) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/file-content`,
        { params: { repo_url: repoUrl, path: itemPath } }
      );
      setContents((prev) => ({
        ...prev,
        [itemPath]: response.data,
      }));
    } catch (error) {
      console.error("Error fetching subdirectory contents:", error);
    }
  };

  const toggleExpand = (path) => {
    const newExpandedNodes = new Set(expandedNodes);
    if (expandedNodes.has(path)) {
      newExpandedNodes.delete(path);
    } else {
      newExpandedNodes.add(path);
      if (!contents[path]) {
        fetchSubdirectoryContents(path);
      }
    }
    setExpandedNodes(newExpandedNodes);
  };

  const handleFileClick = async (item) => {
    const existingTab = tabs.find((tab) => tab.path === item.path);
    if (existingTab) {
      setActiveTab(existingTab);
    } else {
      const newTab = { name: item.name, path: item.path };
      setTabs([...tabs, newTab]);
      setActiveTab(newTab);
    }

    if (!fileContents[item.path]) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/repo/file-content`,
          { params: { repo_url: repoUrl, path: item.path } }
        );
        setFileContents((prev) => ({
          ...prev,
          [item.path]: atob(response.data.content),
        }));

        const extension = item.name.split(".").pop();
        setLanguage(mapExtensionToLanguage(extension));
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    }
  };

  const closeTab = (tabToClose) => {
    const updatedTabs = tabs.filter((tab) => tab.path !== tabToClose.path);
    setTabs(updatedTabs);

    if (activeTab?.path === tabToClose.path) {
      setActiveTab(updatedTabs.length > 0 ? updatedTabs[0] : null);
    }
  };

  const renderTree = (items, parentPath = "") => {
    if (!items) return null;

    return (
      <ul style={{ listStyleType: "none", marginLeft: "20px", padding: 0 }}>
        {items.map((item) => {
          const itemPath = `${parentPath ? `${parentPath}/` : ""}${item.name}`;
          const isExpanded = expandedNodes.has(itemPath);

          return (
            <li key={item.sha}>
              {item.type === "dir" ? (
                <>
                  <span
                    onClick={() => toggleExpand(itemPath)}
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      fontWeight: "bold",
                    }}
                  >
                    {isExpanded ? <FaCaretDown /> : <FaCaretRight />}{" "}
                    {item.name}
                  </span>
                  {isExpanded && renderTree(contents[itemPath], itemPath)}
                </>
              ) : (
                <span
                  onClick={() => handleFileClick(item)}
                  style={{
                    cursor: "pointer",
                    display: "block",
                    padding: "5px 0",
                    backgroundColor:
                      activeTab?.path === item.path ? "#0078d4" : "transparent",
                    borderRadius: "4px",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f4f4f4";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor =
                      activeTab?.path === item.path ? "#0078d4" : "transparent";
                  }}
                >
                  {getFileIcon(item.name.split(".").pop())}
                  <span style={{ marginLeft: "8px" }}>{item.name}</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const getFileIcon = (extension) => {
    switch (extension) {
      case "js":
      case "jsx":
        return <FaJsSquare style={{ color: "#f7df1e" }} />;
      case "py":
        return <FaPython style={{ color: "#306998" }} />;
      case "java":
        return <FaJava style={{ color: "#f44336" }} />;
      case "html":
        return <FaHtml5 style={{ color: "#e44d26" }} />;
      case "css":
        return <FaCss3Alt style={{ color: "#2965f1" }} />;
      case "json":
        return <FaFileAlt style={{ color: "#f5f5f5" }} />;
      case "md":
        return <FaFileAlt style={{ color: "#000000" }} />;
      default:
        return <FaFileAlt style={{ color: "#808080" }} />;
    }
  };

  const mapExtensionToLanguage = (extension) => {
    const extensionMapping = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      xml: "xml",
      txt: "plaintext",
    };
    return extensionMapping[extension] || "plaintext";
  };

  // const addCommentToLine = (lineNumber, comment) => {
  //   const path = activeTab?.path;
  //   if (!path) return;

  //   setLineComments((prev) => {
  //     const newComments = { ...prev };
  //     newComments[path] = {
  //       ...(newComments[path] || {}),
  //       [lineNumber]: comment,
  //     };
  //     return newComments;
  //   });

  //   alert(
  //     `Comment added to file: ${activeTab?.name}\nLine number: ${lineNumber}\nComment: ${comment}`
  //   );
  // };

  const handleEditorClick = (lineNumber) => {
    setCurrentLine(lineNumber);
    setShowCommentPopup(true);
  };

  const handleCommentSubmit = () => {
    if (currentLine != null && commentText.trim() !== "") {
      // addCommentToLine(currentLine, commentText.trim());
      axios
        .post(`${process.env.REACT_APP_BACKEND_URL}/repo/save-line-comment`, {
          repo_url: repoUrl, // Pass the active repository URL
          file_name: activeTab?.name, // File name from the active tab
          line_number: currentLine, // Line number
          comment_text: commentText, // Text of the comment
        })
        .then((response) => {
          console.log(response.data.message);
          alert("Comment saved successfully!");
        })
        .catch((error) => {
          console.error("Error saving comment:", error);
          alert("Failed to save the comment. Please try again.");
        });

      setCommentText("");
      setShowCommentPopup(false);
    }
  };

  const applyLineDecorations = () => {
    if (!editorInstance || !activeTab) return;

    const decorations = [];
    const fileComments = lineComments[activeTab.path] || {};

    for (const line of Object.keys(fileComments)) {
      decorations.push({
        range: new monaco.Range(Number(line), 1, Number(line), 1),
        options: {
          isWholeLine: true,
          glyphMarginClassName: "my-comment-icon", // Custom icon class
          glyphMarginHoverMessage: {
            value: `**Comment**: ${fileComments[line]}`, // Show the comment on hover
          },
        },
      });
    }

    // Add hoverable icons for lines without comments
    const totalLines = editorInstance.getModel()?.getLineCount() || 0;
    for (let line = 1; line <= totalLines; line++) {
      if (!fileComments[line]) {
        decorations.push({
          range: new monaco.Range(line, 1, line, 1),
          options: {
            glyphMarginClassName: "my-comment-icon", // Custom icon class
            glyphMarginHoverMessage: {
              value: "Click here to add a comment",
            },
          },
        });
      }
    }

    editorInstance.deltaDecorations([], decorations);
  };

  editorInstance?.onMouseDown((event) => {
    if (
      event.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
    ) {
      const lineNumber = event.target.position.lineNumber;
      handleEditorClick(lineNumber);
    }
  });

  useEffect(() => {
    if (editorInstance) {
      applyLineDecorations();

      editorInstance.onMouseDown((event) => {
        if (
          event.target.type ===
          monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
        ) {
          const lineNumber = event.target.position.lineNumber;
          handleEditorClick(lineNumber);
        }
      });
    }
  }, [editorInstance, lineComments, activeTab]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left-side Explorer */}
      <div
        style={{
          width: "300px",
          borderRight: "1px solid #ddd",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <h2>Repo Explorer</h2>
        {renderTree(contents[""])}
      </div>

      {/* Right-side Editor */}
      <div style={{ flex: 1, padding: "10px" }}>
        <div style={{ display: "flex", marginBottom: "10px" }}>
          {tabs.map((tab) => (
            <div
              key={tab.path}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "5px 10px",
                backgroundColor:
                  activeTab?.path === tab.path ? "#0078d4" : "#f0f0f0",
                color: activeTab?.path === tab.path ? "#fff" : "#000",
                cursor: "pointer",
                borderRadius: "4px",
                marginRight: "5px",
              }}
            >
              {tab.name}
              <FaTimes
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the tab from being selected when clicking close
                  closeTab(tab);
                }}
              />
            </div>
          ))}
        </div>
        {activeTab && (
          <Editor
            height="90vh"
            theme="vs-dark"
            options={{
              readOnly: true, // Enable adding comments
              wordWrap: "on",
              minimap: { enabled: true },
              glyphMargin: true, // Enable margin for the icons
            }}
            language={language}
            value={fileContents[activeTab.path]}
            onMount={(editor) => setEditorInstance(editor)}
          />
        )}
      </div>

      {showCommentPopup && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            padding: "20px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 999,
            width: "350px",
            borderRadius: "8px", // Rounded corners
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          }}
        >
          <h4
            style={{
              marginBottom: "15px",
              fontSize: "18px",
              color: "#333",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Add Feedback to Line {currentLine} in {activeTab?.name}
          </h4>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your Feedback"
            style={{
              width: "100%",
              height: "120px",
              padding: "12px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              resize: "none", // Prevent resizing
              boxSizing: "border-box", // Ensure padding is included in width/height
              marginBottom: "15px",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "15px",
            }}
          >
            <button
              onClick={handleCommentSubmit}
              style={{
                backgroundColor: "#0078d4",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                width: "45%",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#005a8c")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#0078d4")}
            >
              Submit
            </button>
            <button
              onClick={() => setShowCommentPopup(false)}
              style={{
                backgroundColor: "#ccc",
                color: "#000",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                width: "45%",
                transition: "background-color 0.3s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#999")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#ccc")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoExplorer;
