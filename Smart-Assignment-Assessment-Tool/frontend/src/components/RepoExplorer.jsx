// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Editor } from "@monaco-editor/react";
// import * as monaco from "monaco-editor";
// import {
//   FaJsSquare,
//   FaPython,
//   FaJava,
//   FaHtml5,
//   FaCss3Alt,
//   FaFileAlt,
//   FaCaretRight,
//   FaCaretDown,
//   FaTimes,
//   FaInfoCircle,
// } from "react-icons/fa";
// import "../index.css";
// import "../styles/editor.styles.css";

// const RepoExplorer = ({ repoUrl }) => {
//   const [contents, setContents] = useState({});
//   const [expandedNodes, setExpandedNodes] = useState(new Set());
//   const [tabs, setTabs] = useState([]);
//   const [activeTab, setActiveTab] = useState(null);
//   const [fileContents, setFileContents] = useState({});
//   const [language, setLanguage] = useState("plaintext");
//   const [editorInstance, setEditorInstance] = useState(null);
//   const [lineComments, setLineComments] = useState({});
//   const [currentLine, setCurrentLine] = useState(null);
//   const [commentText, setCommentText] = useState("");
//   const [showCommentPopup, setShowCommentPopup] = useState(false);

//   useEffect(() => {
//     const fetchRootContents = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/repo/repo-contents`,
//           { params: { repo_url: repoUrl } }
//         );
//         setContents((prev) => ({
//           ...prev,
//           "": response.data,
//         }));
//       } catch (error) {
//         console.error("Error fetching repository contents:", error);
//       }
//     };
//     fetchRootContents();
//   }, [repoUrl]);

//   const fetchSubdirectoryContents = async (itemPath) => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/repo/file-content`,
//         { params: { repo_url: repoUrl, path: itemPath } }
//       );
//       setContents((prev) => ({
//         ...prev,
//         [itemPath]: response.data,
//       }));
//     } catch (error) {
//       console.error("Error fetching subdirectory contents:", error);
//     }
//   };

//   const toggleExpand = (path) => {
//     const newExpandedNodes = new Set(expandedNodes);
//     if (expandedNodes.has(path)) {
//       newExpandedNodes.delete(path);
//     } else {
//       newExpandedNodes.add(path);
//       if (!contents[path]) {
//         fetchSubdirectoryContents(path);
//       }
//     }
//     setExpandedNodes(newExpandedNodes);
//   };

//   const handleFileClick = async (item) => {
//     const existingTab = tabs.find((tab) => tab.path === item.path);
//     if (existingTab) {
//       setActiveTab(existingTab);
//     } else {
//       const newTab = { name: item.name, path: item.path };
//       setTabs([...tabs, newTab]);
//       setActiveTab(newTab);
//     }

//     if (!fileContents[item.path]) {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/repo/file-content`,
//           { params: { repo_url: repoUrl, path: item.path } }
//         );
//         setFileContents((prev) => ({
//           ...prev,
//           [item.path]: atob(response.data.content),
//         }));

//         const extension = item.name.split(".").pop();
//         setLanguage(mapExtensionToLanguage(extension));
//       } catch (error) {
//         console.error("Error fetching file content:", error);
//       }
//     }
//   };

//   const closeTab = (tabToClose) => {
//     const updatedTabs = tabs.filter((tab) => tab.path !== tabToClose.path);
//     setTabs(updatedTabs);

//     if (activeTab?.path === tabToClose.path) {
//       setActiveTab(updatedTabs.length > 0 ? updatedTabs[0] : null);
//     }
//   };

//   const renderTree = (items, parentPath = "") => {
//     if (!items) return null;

//     return (
//       <ul style={{ listStyleType: "none", marginLeft: "20px", padding: 0 }}>
//         {items.map((item) => {
//           const itemPath = `${parentPath ? `${parentPath}/` : ""}${item.name}`;
//           const isExpanded = expandedNodes.has(itemPath);

//           return (
//             <li key={item.sha}>
//               {item.type === "dir" ? (
//                 <>
//                   <span
//                     onClick={() => toggleExpand(itemPath)}
//                     style={{
//                       cursor: "pointer",
//                       color: "blue",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     {isExpanded ? <FaCaretDown /> : <FaCaretRight />}{" "}
//                     {item.name}
//                   </span>
//                   {isExpanded && renderTree(contents[itemPath], itemPath)}
//                 </>
//               ) : (
//                 <span
//                   onClick={() => handleFileClick(item)}
//                   style={{
//                     cursor: "pointer",
//                     display: "block",
//                     padding: "5px 0",
//                     backgroundColor:
//                       activeTab?.path === item.path ? "#0078d4" : "transparent",
//                     borderRadius: "4px",
//                     transition: "background-color 0.3s ease",
//                   }}
//                   onMouseEnter={(e) => {
//                     e.target.style.backgroundColor = "#f4f4f4";
//                   }}
//                   onMouseLeave={(e) => {
//                     e.target.style.backgroundColor =
//                       activeTab?.path === item.path ? "#0078d4" : "transparent";
//                   }}
//                 >
//                   {getFileIcon(item.name.split(".").pop())}
//                   <span style={{ marginLeft: "8px" }}>{item.name}</span>
//                 </span>
//               )}
//             </li>
//           );
//         })}
//       </ul>
//     );
//   };

//   const getFileIcon = (extension) => {
//     switch (extension) {
//       case "js":
//       case "jsx":
//         return <FaJsSquare style={{ color: "#f7df1e" }} />;
//       case "py":
//         return <FaPython style={{ color: "#306998" }} />;
//       case "java":
//         return <FaJava style={{ color: "#f44336" }} />;
//       case "html":
//         return <FaHtml5 style={{ color: "#e44d26" }} />;
//       case "css":
//         return <FaCss3Alt style={{ color: "#2965f1" }} />;
//       case "json":
//         return <FaFileAlt style={{ color: "#f5f5f5" }} />;
//       case "md":
//         return <FaFileAlt style={{ color: "#000000" }} />;
//       default:
//         return <FaFileAlt style={{ color: "#808080" }} />;
//     }
//   };

//   const mapExtensionToLanguage = (extension) => {
//     const extensionMapping = {
//       js: "javascript",
//       jsx: "javascript",
//       ts: "typescript",
//       tsx: "typescript",
//       py: "python",
//       java: "java",
//       html: "html",
//       css: "css",
//       json: "json",
//       md: "markdown",
//       xml: "xml",
//       txt: "plaintext",
//     };
//     return extensionMapping[extension] || "plaintext";
//   };

//   const handleEditorClick = (lineNumber) => {
//     setCurrentLine(lineNumber);
//     setShowCommentPopup(true);
//   };

//   const handleCommentSubmit = () => {
//     if (currentLine != null && commentText.trim() !== "") {
//       // addCommentToLine(currentLine, commentText.trim());
//       axios
//         .post(`${process.env.REACT_APP_BACKEND_URL}/repo/save-line-comment`, {
//           repo_url: repoUrl, // Pass the active repository URL
//           file_name: activeTab?.name, // File name from the active tab
//           line_number: currentLine, // Line number
//           comment_text: commentText, // Text of the comment
//         })
//         .then((response) => {
//           console.log(response.data.message);
//           alert("Comment saved successfully!");
//         })
//         .catch((error) => {
//           console.error("Error saving comment:", error);
//           alert("Failed to save the comment. Please try again.");
//         });

//       setCommentText("");
//       setShowCommentPopup(false);
//     }
//   };

//   const applyLineDecorations = () => {
//     if (!editorInstance || !activeTab) return;

//     const decorations = [];
//     const fileComments = lineComments[activeTab.path] || {};

//     for (const line of Object.keys(fileComments)) {
//       decorations.push({
//         range: new monaco.Range(Number(line), 1, Number(line), 1),
//         options: {
//           isWholeLine: true,
//           glyphMarginClassName: "my-comment-icon", // Custom icon class
//           glyphMarginHoverMessage: {
//             value: `**Comment**: ${fileComments[line]}`, // Show the comment on hover
//           },
//         },
//       });
//     }

//     // Add hoverable icons for lines without comments
//     const totalLines = editorInstance.getModel()?.getLineCount() || 0;
//     for (let line = 1; line <= totalLines; line++) {
//       if (!fileComments[line]) {
//         decorations.push({
//           range: new monaco.Range(line, 1, line, 1),
//           options: {
//             glyphMarginClassName: "my-comment-icon", // Custom icon class
//             glyphMarginHoverMessage: {
//               value: "Click here to add a comment",
//             },
//           },
//         });
//       }
//     }

//     editorInstance.deltaDecorations([], decorations);
//   };

//   editorInstance?.onMouseDown((event) => {
//     if (
//       event.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
//     ) {
//       const lineNumber = event.target.position.lineNumber;
//       handleEditorClick(lineNumber);
//     }
//   });

//   useEffect(() => {
//     if (editorInstance) {
//       applyLineDecorations();

//       editorInstance.onMouseDown((event) => {
//         if (
//           event.target.type ===
//           monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
//         ) {
//           const lineNumber = event.target.position.lineNumber;
//           handleEditorClick(lineNumber);
//         }
//       });
//     }
//   }, [editorInstance, lineComments, activeTab]);

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       {/* Left-side Explorer */}
//       <div
//         style={{
//           width: "300px",
//           borderRight: "1px solid #ddd",
//           padding: "10px",
//           overflowY: "auto",
//         }}
//       >
//         <h2>Repo Explorer</h2>
//         {renderTree(contents[""])}
//       </div>

//       {/* Right-side Editor */}
//       <div style={{ flex: 1, padding: "10px" }}>
//         <div style={{ display: "flex", marginBottom: "10px" }}>
//           {tabs.map((tab) => (
//             <div
//               key={tab.path}
//               onClick={() => setActiveTab(tab)}
//               style={{
//                 padding: "5px 10px",
//                 backgroundColor:
//                   activeTab?.path === tab.path ? "#0078d4" : "#f0f0f0",
//                 color: activeTab?.path === tab.path ? "#fff" : "#000",
//                 cursor: "pointer",
//                 borderRadius: "4px",
//                 marginRight: "5px",
//               }}
//             >
//               {tab.name}
//               <FaTimes
//                 style={{
//                   marginLeft: "5px",
//                   cursor: "pointer",
//                   fontSize: "14px",
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation(); // Prevent the tab from being selected when clicking close
//                   closeTab(tab);
//                 }}
//               />
//             </div>
//           ))}
//         </div>
//         {activeTab && (
//           <Editor
//             height="90vh"
//             theme="vs-dark"
//             options={{
//               readOnly: true, // Enable adding comments
//               wordWrap: "on",
//               minimap: { enabled: true },
//               glyphMargin: true, // Enable margin for the icons
//             }}
//             language={language}
//             value={fileContents[activeTab.path]}
//             onMount={(editor) => setEditorInstance(editor)}
//           />
//         )}
//       </div>

//       {showCommentPopup && (
//         <div
//           style={{
//             position: "absolute",
//             top: "20%",
//             left: "50%",
//             transform: "translateX(-50%)",
//             backgroundColor: "#fff",
//             border: "1px solid #ddd",
//             padding: "20px",
//             boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
//             zIndex: 999,
//             width: "350px",
//             borderRadius: "8px", // Rounded corners
//             fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//           }}
//         >
//           <h4
//             style={{
//               marginBottom: "15px",
//               fontSize: "18px",
//               color: "#333",
//               fontWeight: "600",
//               textAlign: "center",
//             }}
//           >
//             Add Feedback to Line {currentLine} in {activeTab?.name}
//           </h4>
//           <textarea
//             value={commentText}
//             onChange={(e) => setCommentText(e.target.value)}
//             placeholder="Enter your Feedback"
//             style={{
//               width: "100%",
//               height: "120px",
//               padding: "12px",
//               fontSize: "14px",
//               border: "1px solid #ccc",
//               borderRadius: "6px",
//               resize: "none", // Prevent resizing
//               boxSizing: "border-box", // Ensure padding is included in width/height
//               marginBottom: "15px",
//               fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//             }}
//           />
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "space-between",
//               marginTop: "15px",
//             }}
//           >
//             <button
//               onClick={handleCommentSubmit}
//               style={{
//                 backgroundColor: "#0078d4",
//                 color: "#fff",
//                 border: "none",
//                 padding: "10px 20px",
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 fontSize: "14px",
//                 width: "45%",
//                 transition: "background-color 0.3s",
//               }}
//               onMouseOver={(e) => (e.target.style.backgroundColor = "#005a8c")}
//               onMouseOut={(e) => (e.target.style.backgroundColor = "#0078d4")}
//             >
//               Submit
//             </button>
//             <button
//               onClick={() => setShowCommentPopup(false)}
//               style={{
//                 backgroundColor: "#ccc",
//                 color: "#000",
//                 border: "none",
//                 padding: "10px 20px",
//                 borderRadius: "6px",
//                 cursor: "pointer",
//                 fontSize: "14px",
//                 width: "45%",
//                 transition: "background-color 0.3s",
//               }}
//               onMouseOver={(e) => (e.target.style.backgroundColor = "#999")}
//               onMouseOut={(e) => (e.target.style.backgroundColor = "#ccc")}
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RepoExplorer;

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
  FaFolder,
  FaFolderOpen,
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
          { params: { repo_url: repoUrl } },
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
        { params: { repo_url: repoUrl, path: itemPath } },
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
          { params: { repo_url: repoUrl, path: item.path } },
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
      <ul className="ml-4 list-none p-0">
        {items.map((item) => {
          const itemPath = `${parentPath ? `${parentPath}/` : ""}${item.name}`;
          const isExpanded = expandedNodes.has(itemPath);

          return (
            <li key={item.sha} className="py-1">
              {item.type === "dir" ? (
                <div className="group">
                  <div
                    onClick={() => toggleExpand(itemPath)}
                    className="flex cursor-pointer items-center rounded px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="text-primary-600 dark:text-primary-400 mr-2">
                      {isExpanded ? <FaFolderOpen /> : <FaFolder />}
                    </span>
                    <span className="flex-1 font-medium text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                    <span className="text-gray-500">
                      {isExpanded ? <FaCaretDown /> : <FaCaretRight />}
                    </span>
                  </div>
                  {isExpanded && renderTree(contents[itemPath], itemPath)}
                </div>
              ) : (
                <div
                  onClick={() => handleFileClick(item)}
                  className={`flex cursor-pointer items-center rounded px-2 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    activeTab?.path === item.path
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="mr-2">
                    {getFileIcon(item.name.split(".").pop())}
                  </span>
                  <span className="truncate">{item.name}</span>
                </div>
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
        return <FaJsSquare className="text-yellow-400" />;
      case "py":
        return <FaPython className="text-blue-600" />;
      case "java":
        return <FaJava className="text-red-500" />;
      case "html":
        return <FaHtml5 className="text-orange-500" />;
      case "css":
        return <FaCss3Alt className="text-blue-500" />;
      case "json":
        return <FaFileAlt className="text-gray-400" />;
      case "md":
        return <FaFileAlt className="text-gray-700" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
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
    <div className="flex h-full w-full overflow-hidden bg-white dark:bg-gray-900">
      {/* Left-side Explorer */}
      <div className="fixed mb-4 flex items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Repository Explorer
        </h2>
      </div>
      <div className="w-72 mt-8 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div>{renderTree(contents[""])}</div>
      </div>

      {/* Right-side Editor */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-100 px-2 dark:border-gray-800 dark:bg-gray-800">
          {tabs.map((tab) => (
            <div
              key={tab.path}
              onClick={() => setActiveTab(tab)}
              className={`group flex cursor-pointer items-center rounded-t px-4 py-2 ${
                activeTab?.path === tab.path
                  ? "text-primary-700 dark:text-primary-300 bg-white dark:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-2">
                {getFileIcon(tab.name.split(".").pop())}
              </span>
              <span className="max-w-xs truncate">{tab.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab);
                }}
                className="ml-2 rounded-full p-1 text-gray-500 opacity-70 hover:bg-gray-200 hover:opacity-100 dark:hover:bg-gray-600"
              >
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          {activeTab ? (
            <Editor
              height="100%"
              theme="vs-dark"
              options={{
                readOnly: true,
                wordWrap: "on",
                minimap: { enabled: true },
                glyphMargin: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                fontFamily: "'Fira Code', monospace",
                fontSize: 14,
              }}
              language={language}
              value={fileContents[activeTab.path]}
              onMount={(editor) => setEditorInstance(editor)}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <FaInfoCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-700 dark:text-gray-300">
                  No File Selected
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a file from the explorer to view its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comment Popup */}
      {showCommentPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="mb-4 text-center text-lg font-semibold text-gray-800 dark:text-white">
              Add Feedback to Line {currentLine} in {activeTab?.name}
            </h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Enter your feedback..."
              className="focus:border-primary-500 focus:ring-primary-200 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              rows={5}
            />
            <div className="mt-5 flex justify-end space-x-3">
              <button
                onClick={() => setShowCommentPopup(false)}
                className="focus:ring-primary-500 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-800 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoExplorer;
