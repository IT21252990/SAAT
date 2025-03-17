// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const ContributorCommitHistory = ({ repoUrl }) => {
//   const [contributors, setContributors] = useState([]);
//   const [selectedContributor, setSelectedContributor] = useState(null);
//   const [commitHistory, setCommitHistory] = useState([]);
//   const [totalCommits, setTotalCommits] = useState(0);
//   const [pagination, setPagination] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const styles = {
//     container: {
//       maxWidth: "800px",
//       margin: "0 auto",
//       padding: "20px",
//       fontFamily: "Arial, sans-serif",
//     },
//     contributorList: {
//       display: "flex",
//       flexWrap: "wrap",
//       gap: "10px",
//       padding: 0,
//       listStyleType: "none",
//     },
//     contributorItem: {
//       display: "flex",
//       alignItems: "center",
//       cursor: "pointer",
//       border: "1px solid #ccc",
//       borderRadius: "5px",
//       padding: "10px",
//       transition: "background-color 0.3s",
//     },
//     contributorItemHover: {
//       backgroundColor: "#f1f1f1",
//     },
//     contributorImage: {
//       width: "40px",
//       height: "40px",
//       borderRadius: "50%",
//       marginRight: "10px",
//     },
//     commitsContainer: {
//       marginTop: "20px",
//     },
//     commitItem: {
//       marginBottom: "15px",
//       padding: "10px",
//       border: "1px solid #ddd",
//       borderRadius: "5px",
//     },
//     commitLink: {
//       color: "#007bff",
//       textDecoration: "none",
//     },
//     pagination: {
//       display: "flex",
//       justifyContent: "space-between",
//       marginTop: "20px",
//     },
//     error: {
//       color: "red",
//       marginBottom: "10px",
//     },
//     loading: {
//       marginTop: "10px",
//       fontStyle: "italic",
//     }
//   };

//   useEffect(() => {
//     const fetchContributors = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/repo/contributors`,
//           { params: { repo_url: repoUrl } }
//         );
//         setContributors(response.data);
//       } catch (err) {
//         console.error("Error fetching contributors:", err);
//         setError("Failed to fetch contributors data.");
//       }
//     };

//     if (repoUrl) fetchContributors();
//   }, [repoUrl]);

//   const fetchCommitHistory = async (contributor, page = 1) => {
//     setError(null);
//     setCommitHistory([]);
//     setLoading(true);
//     setTotalCommits(0);
//     setSelectedContributor(contributor);
//     setCurrentPage(page);

//     try {
//       console.log(`Fetching commits for: ${contributor.login}, page: ${page}`);
      
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/repo/commits`,
//         {
//           params: {
//             repo_url: repoUrl,
//             contributor_login: contributor.login,
//             page,
//           },
//         }
//       );
      
//       console.log("API Response:", response.data);
      
//       if (response.data && response.data.commits) {
//         setCommitHistory(response.data.commits);
//         setTotalCommits(response.data.total_commits || contributor.contributions || 0);
//         setPagination(response.data.pagination || {});
//       } else {
//         console.error("Invalid response format:", response.data);
//         setError("Invalid response format from server.");
//       }
//     } catch (err) {
//       console.error("Error fetching commits:", err);
//       setError(`Failed to fetch commit history: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePagination = (direction) => {
//     if (!selectedContributor) return;
    
//     let newPage;
//     if (direction === 'prev') {
//       newPage = pagination.prev ? Number(new URLSearchParams(pagination.prev).get("page")) : currentPage - 1;
//     } else {
//       newPage = pagination.next ? Number(new URLSearchParams(pagination.next).get("page")) : currentPage + 1;
//     }
    
//     fetchCommitHistory(selectedContributor, newPage);
//   };

//   return (
//     <div style={styles.container}>
//       <h2>Contributors</h2>
//       {error && <p style={styles.error}>{error}</p>}
//       <ul style={styles.contributorList}>
//         {contributors.map((contributor) => (
//           <li
//             key={contributor.id}
//             style={{
//               ...styles.contributorItem,
//               backgroundColor: selectedContributor?.login === contributor.login ? "#e6f7ff" : ""
//             }}
//             onMouseOver={(e) =>
//               (e.currentTarget.style.backgroundColor = selectedContributor?.login === contributor.login ? "#d6f0ff" : "#f1f1f1")
//             }
//             onMouseOut={(e) =>
//               (e.currentTarget.style.backgroundColor = selectedContributor?.login === contributor.login ? "#e6f7ff" : "")
//             }
//             onClick={() => fetchCommitHistory(contributor)}
//           >
//             <img
//               src={contributor.avatar_url}
//               alt={`${contributor.login}'s avatar`}
//               style={styles.contributorImage}
//             />
//             <span>
//               {contributor.login} (Commits: {contributor.contributions})
//             </span>
//           </li>
//         ))}
//       </ul>

//       {selectedContributor && (
//         <div style={styles.commitsContainer}>
//           <h3>
//             Commit History for <span>{selectedContributor.login}</span>
//           </h3>
//           <p>
//             <strong>Total Commits:</strong> {totalCommits}
//           </p>
          
//           {loading ? (
//             <p style={styles.loading}>Loading commits...</p>
//           ) : !commitHistory || commitHistory.length === 0 ? (
//             <p>No commits found for this contributor.</p>
//           ) : (
//             <ul style={{ listStyleType: "none", padding: 0 }}>
//               {commitHistory.map((commit) => (
//                 <li key={commit.sha} style={styles.commitItem}>
//                   <p>
//                     <strong>Message:</strong>{" "}
//                     {commit.commit?.message || "No message"}
//                   </p>
//                   <p>
//                     <strong>Date:</strong>{" "}
//                     {commit.commit?.author?.date
//                       ? new Date(commit.commit.author.date).toLocaleString()
//                       : "No date available"}
//                   </p>
//                   <p>
//                     <a
//                       href={commit.html_url || "#"}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       style={styles.commitLink}
//                     >
//                       View Commit
//                     </a>
//                   </p>
//                 </li>
//               ))}
//             </ul>
//           )}

//           {(pagination.prev || pagination.next) && (
//             <div style={styles.pagination}>
//               <button 
//                 onClick={() => handlePagination('prev')}
//                 disabled={!pagination.prev}
//                 style={{ opacity: pagination.prev ? 1 : 0.5 }}
//               >
//                 Previous
//               </button>
//               <span>Page: {currentPage}</span>
//               <button 
//                 onClick={() => handlePagination('next')}
//                 disabled={!pagination.next}
//                 style={{ opacity: pagination.next ? 1 : 0.5 }}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ContributorCommitHistory;

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const ContributorCommitHistory = ({ repoUrl }) => {
//   const [contributors, setContributors] = useState([]);
//   const [selectedContributor, setSelectedContributor] = useState(null);
//   const [commitHistory, setCommitHistory] = useState([]);
//   const [totalCommits, setTotalCommits] = useState(0);
//   const [pagination, setPagination] = useState({});
//   const [currentPage, setCurrentPage] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Keep the original styles object for reference, but we won't use it
//   const styles = {
//     container: {
//       maxWidth: "800px",
//       margin: "0 auto",
//       padding: "20px",
//       fontFamily: "Arial, sans-serif",
//     },
//     contributorList: {
//       display: "flex",
//       flexWrap: "wrap",
//       gap: "10px",
//       padding: 0,
//       listStyleType: "none",
//     },
//     contributorItem: {
//       display: "flex",
//       alignItems: "center",
//       cursor: "pointer",
//       border: "1px solid #ccc",
//       borderRadius: "5px",
//       padding: "10px",
//       transition: "background-color 0.3s",
//     },
//     contributorItemHover: {
//       backgroundColor: "#f1f1f1",
//     },
//     contributorImage: {
//       width: "40px",
//       height: "40px",
//       borderRadius: "50%",
//       marginRight: "10px",
//     },
//     commitsContainer: {
//       marginTop: "20px",
//     },
//     commitItem: {
//       marginBottom: "15px",
//       padding: "10px",
//       border: "1px solid #ddd",
//       borderRadius: "5px",
//     },
//     commitLink: {
//       color: "#007bff",
//       textDecoration: "none",
//     },
//     pagination: {
//       display: "flex",
//       justifyContent: "space-between",
//       marginTop: "20px",
//     },
//     error: {
//       color: "red",
//       marginBottom: "10px",
//     },
//     loading: {
//       marginTop: "10px",
//       fontStyle: "italic",
//     }
//   };

//   useEffect(() => {
//     const fetchContributors = async () => {
//       try {
//         const response = await axios.get(
//           `${import.meta.env.VITE_BACKEND_URL}/repo/contributors`,
//           { params: { repo_url: repoUrl } }
//         );
//         setContributors(response.data);
//       } catch (err) {
//         console.error("Error fetching contributors:", err);
//         setError("Failed to fetch contributors data.");
//       }
//     };

//     if (repoUrl) fetchContributors();
//   }, [repoUrl]);

//   const fetchCommitHistory = async (contributor, page = 1) => {
//     setError(null);
//     setCommitHistory([]);
//     setLoading(true);
//     setTotalCommits(0);
//     setSelectedContributor(contributor);
//     setCurrentPage(page);

//     try {
//       console.log(`Fetching commits for: ${contributor.login}, page: ${page}`);
      
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/repo/commits`,
//         {
//           params: {
//             repo_url: repoUrl,
//             contributor_login: contributor.login,
//             page,
//           },
//         }
//       );
      
//       console.log("API Response:", response.data);
      
//       if (response.data && response.data.commits) {
//         setCommitHistory(response.data.commits);
//         setTotalCommits(contributor.contributions || 0);
//         setPagination(response.data.pagination || {});
//       } else {
//         console.error("Invalid response format:", response.data);
//         setError("Invalid response format from server.");
//       }
//     } catch (err) {
//       console.error("Error fetching commits:", err);
//       setError(`Failed to fetch commit history: ${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePagination = (direction) => {
//     if (!selectedContributor) return;
    
//     let newPage;
//     if (direction === 'prev') {
//       newPage = pagination.prev ? Number(new URLSearchParams(pagination.prev).get("page")) : currentPage - 1;
//     } else {
//       newPage = pagination.next ? Number(new URLSearchParams(pagination.next).get("page")) : currentPage + 1;
//     }
    
//     fetchCommitHistory(selectedContributor, newPage);
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-5 font-sans">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">Contributors</h2>
      
//       {error && <p className="text-red-600 mb-3">{error}</p>}
      
//       <ul className="flex flex-wrap gap-2 mb-6">
//         {contributors.map((contributor) => (
//           <li
//             key={contributor.id}
//             className={`flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors duration-300 hover:bg-gray-100 ${
//               selectedContributor?.login === contributor.login ? "bg-primary-100" : ""
//             }`}
//             onClick={() => fetchCommitHistory(contributor)}
//           >
//             <img
//               src={contributor.avatar_url}
//               alt={`${contributor.login}'s avatar`}
//               className="w-10 h-10 rounded-full mr-3"
//             />
//             <span className="text-gray-700">
//               {contributor.login} <span className="text-gray-500 text-sm">(Commits: {contributor.contributions})</span>
//             </span>
//           </li>
//         ))}
//       </ul>

//       {selectedContributor && (
//         <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
//           <h3 className="text-xl font-semibold text-gray-800 mb-2">
//             Commit History for <span className="text-primary-600">{selectedContributor.login}</span>
//           </h3>
//           <p className="mb-4">
//             <span className="font-medium">Total Commits:</span> {totalCommits}
//           </p>
          
//           {loading ? (
//             <p className="mt-3 text-gray-500 italic">Loading commits...</p>
//           ) : !commitHistory || commitHistory.length === 0 ? (
//             <p className="mt-3 text-gray-500">No commits found for this contributor.</p>
//           ) : (
//             <ul className="space-y-4">
//               {commitHistory.map((commit) => (
//                 <li key={commit.sha} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
//                   <p className="mb-2">
//                     <span className="font-medium">Message:</span>{" "}
//                     <span className="text-gray-700">{commit.commit?.message || "No message"}</span>
//                   </p>
//                   <p className="mb-2 text-gray-600">
//                     <span className="font-medium">Date:</span>{" "}
//                     {commit.commit?.author?.date
//                       ? new Date(commit.commit.author.date).toLocaleString()
//                       : "No date available"}
//                   </p>
//                   <a
//                     href={commit.html_url || "#"}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center"
//                   >
//                     View Commit
//                     <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
//                     </svg>
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           )}

//           {(pagination.prev || pagination.next) && (
//             <div className="flex justify-between items-center mt-6">
//               <button 
//                 onClick={() => handlePagination('prev')}
//                 disabled={!pagination.prev}
//                 className={`px-4 py-2 rounded-lg font-medium ${
//                   pagination.prev 
//                     ? "bg-primary-600 text-white hover:bg-primary-700" 
//                     : "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 }`}
//               >
//                 Previous
//               </button>
//               <span className="text-gray-600">Page: {currentPage}</span>
//               <button 
//                 onClick={() => handlePagination('next')}
//                 disabled={!pagination.next}
//                 className={`px-4 py-2 rounded-lg font-medium ${
//                   pagination.next 
//                     ? "bg-primary-600 text-white hover:bg-primary-700" 
//                     : "bg-gray-200 text-gray-500 cursor-not-allowed"
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ContributorCommitHistory;

import React, { useState, useEffect } from "react";
import axios from "axios";
import ContributorDetails from "./ContributorDetails";

const ContributorCommitHistory = ({ repoUrl }) => {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedContributor, setSelectedContributor] = useState(null);

  useEffect(() => {
    const fetchContributors = async () => {
      if (!repoUrl) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/repo/contributors`,
          { params: { repo_url: repoUrl } }
        );
        setContributors(response.data);
      } catch (err) {
        console.error("Error fetching contributors:", err);
        setError("Failed to fetch contributors data.");
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [repoUrl]);

  const handleContributorClick = (contributor) => {
    setSelectedContributor(contributor);
  };

  const handleBackToList = () => {
    setSelectedContributor(null);
  };

  // If a contributor is selected, show the details component
  if (selectedContributor) {
    return (
      <ContributorDetails 
        contributor={selectedContributor} 
        repoUrl={repoUrl} 
        onBack={handleBackToList} 
      />
    );
  }

  // Otherwise show the contributors list
  return (
    <div className="max-w-full mx-auto p-5 font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Contributors</h2>
      
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {loading && <p className="text-gray-500 italic mb-3">Loading contributors...</p>}
      
      <ul className="flex flex-wrap gap-2 mb-6">
        {contributors.map((contributor) => (
          <li
            key={contributor.id}
            className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer transition-colors duration-300 hover:bg-gray-100"
            onClick={() => handleContributorClick(contributor)}
          >
            <img
              src={contributor.avatar_url}
              alt={`${contributor.login}'s avatar`}
              className="w-10 h-10 rounded-full mr-3"
            />
            <span className="text-gray-700">
              {contributor.login} <span className="text-gray-500 text-sm">(Commits: {contributor.contributions})</span>
            </span>
          </li>
        ))}
      </ul>

      {!loading && contributors.length === 0 && !error && (
        <p className="text-gray-500">No contributors found for this repository.</p>
      )}
    </div>
  );
};

export default ContributorCommitHistory;