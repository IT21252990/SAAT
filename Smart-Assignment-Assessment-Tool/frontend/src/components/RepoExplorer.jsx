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
import { Spinner } from "flowbite-react";
import { useToast } from "../contexts/ToastContext";
import "../index.css";
import "../styles/editor.styles.css";

const RepoExplorer = ({ repoUrl , codeId }) => {
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPaths, setLoadingPaths] = useState(new Set());
  const {showToast} = useToast();

  useEffect(() => {
    const fetchRootContents = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchRootContents();
  }, [repoUrl]);

  const fetchSubdirectoryContents = async (itemPath) => {
    try {
      setLoadingPaths(prev => new Set(prev).add(itemPath));
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
    } finally {
      setLoadingPaths(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemPath);
        return newSet;
      });
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
        setLoadingPaths(prev => new Set(prev).add(item.path));
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
      } finally {
        setLoadingPaths(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.path);
          return newSet;
        });
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
    if (!items) {
      if (isLoading && parentPath === "") {
        return (
          <div className="flex justify-center items-center p-8">
            <Spinner size="lg" className="text-primary-600 dark:text-primary-400" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading repository...</span>
          </div>
        );
      }
      return null;
    }

    return (
      <ul className="ml-4 list-none p-0">
        {items.map((item) => {
          const itemPath = `${parentPath ? `${parentPath}/` : ""}${item.name}`;
          const isExpanded = expandedNodes.has(itemPath);
          const isItemLoading = loadingPaths.has(itemPath);

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
                    {isItemLoading ? (
                      <Spinner size="sm" className="text-primary-600 dark:text-primary-400" />
                    ) : (
                      <span className="text-gray-500">
                        {isExpanded ? <FaCaretDown /> : <FaCaretRight />}
                      </span>
                    )}
                  </div>
                  {isExpanded && 
                    (contents[itemPath] ? 
                      renderTree(contents[itemPath], itemPath) : 
                      <div className="ml-6 mt-2 flex items-center">
                        <Spinner size="sm" className="text-primary-600 dark:text-primary-400" />
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading contents...</span>
                      </div>
                    )
                  }
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
                  {loadingPaths.has(item.path) && (
                    <Spinner size="sm" className="ml-auto text-primary-600 dark:text-primary-400" />
                  )}
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
      axios
        .post(
          `${import.meta.env.VITE_BACKEND_URL}/repo/save-line-comment?code_id=${codeId}`,
          {
            file_name: activeTab?.name,
            line_number: currentLine,
            comment_text: commentText,
          }
        )
        .then((response) => {
          console.log(response.data.message);
          showToast("Comment saved successfully!", "success");
        })
        .catch((error) => {
          console.error("Error saving comment:", error);
          showToast("Failed to save comment. Please try again.", "error");
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
            loadingPaths.has(activeTab.path) ? (
              <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <Spinner size="xl" className="mx-auto mb-4 text-primary-600 dark:text-primary-400" />
                  <p className="text-gray-600 dark:text-gray-400">Loading file content...</p>
                </div>
              </div>
            ) : (
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
            )
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