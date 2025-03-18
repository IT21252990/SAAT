import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DisplayCodeComments = ({ codeId }) => {
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [files, setFiles] = useState([]);
  const [expandedFile, setExpandedFile] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (!codeId) {
      setError("Missing code ID");
      setLoading(false);
      return;
    }
    fetchComments();
  }, [codeId]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/code-comments`,
        {
          params: { code_id: codeId }
        }
      );
      
      if (response.data && response.data.comments) {
        setComments(response.data.comments);
        // Extract unique file names
        const fileNames = Object.keys(response.data.comments);
        setFiles(fileNames);
        if (fileNames.length > 0) {
          setExpandedFile(fileNames[0]);
        }
      } else {
        setComments({});
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(`Failed to fetch comments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (fileName, lineNumber, commentIndex) => {
    setCommentToDelete({ fileName, lineNumber, commentIndex });
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete || deleteLoading) return;
    
    const { fileName, lineNumber, commentIndex } = commentToDelete;
    setDeleteLoading(true);
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/repo/delete-comment`,
        {
          params: { code_id: codeId },
          data: {
            file_name: fileName,
            line_number: lineNumber,
            comment_index: commentIndex
          }
        }
      );
      
      // Update local state after successful deletion
      const updatedComments = { ...comments };
      updatedComments[fileName][lineNumber].splice(commentIndex, 1);
      
      // If this was the last comment for this line, remove the line
      if (updatedComments[fileName][lineNumber].length === 0) {
        delete updatedComments[fileName][lineNumber];
      }
      
      // If this was the last line for this file, remove the file
      if (Object.keys(updatedComments[fileName]).length === 0) {
        delete updatedComments[fileName];
        const updatedFiles = files.filter(file => file !== fileName);
        setFiles(updatedFiles);
        
        // If this was the expanded file, reset expandedFile
        if (expandedFile === fileName && updatedFiles.length > 0) {
          setExpandedFile(updatedFiles[0]);
        } else if (updatedFiles.length === 0) {
          setExpandedFile(null);
        }
      }
      
      setComments(updatedComments);
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError(`Failed to delete comment: ${err.message}`);
    } finally {
      setDeleteLoading(false);
      setShowConfirmation(false);
      setCommentToDelete(null);
    }
  };

  const toggleFileExpansion = (fileName) => {
    setExpandedFile(expandedFile === fileName ? null : fileName);
  };

  const getCommentCount = (fileName) => {
    if (!comments[fileName]) return 0;
    
    return Object.values(comments[fileName]).reduce((count, lineComments) => {
      return count + lineComments.length;
    }, 0);
  };

  const ConfirmationDialog = () => {
    if (!showConfirmation) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 animate-fade-in">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete this comment? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowConfirmation(false);
                setCommentToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-500 dark:text-gray-400">Loading comments...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
          <svg 
            className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"></path>
          </svg>
          Code Comments
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-red-700 dark:text-red-300 text-sm flex items-start">
          <svg 
            className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
          {error}
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg 
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
          </svg>
          <p className="mb-1">No comments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {files.map((fileName) => (
            <div key={fileName} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div 
                className="bg-gray-100 dark:bg-gray-700 p-3 flex justify-between items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                onClick={() => toggleFileExpansion(fileName)}
              >
                <div className="flex items-center">
                  <svg 
                    className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="font-medium text-gray-700 dark:text-gray-200">{fileName}</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs px-2 py-1 rounded-full mr-2">
                    {getCommentCount(fileName)} comments
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform duration-300 ${expandedFile === fileName ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
              
              {expandedFile === fileName && (
                <div className="p-4">
                  {Object.entries(comments[fileName] || {}).map(([lineNumber, lineComments]) => (
                    <div key={lineNumber} className="mb-4 last:mb-0">
                      <div className="flex items-center mb-2">
                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium px-2.5 py-1 rounded-md mr-2">
                          Line {lineNumber}
                        </span>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 flex-grow"></div>
                      </div>
                      <div className="space-y-2 pl-2 border-l-2 border-primary-200 dark:border-primary-800">
                        {lineComments.map((comment, index) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{comment}</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(fileName, lineNumber, index);
                                }}
                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors duration-200 flex-shrink-0 ml-2"
                                title="Delete comment"
                              >
                                <svg 
                                  className="w-5 h-5" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationDialog />
    </div>
  );
};

export default DisplayCodeComments;