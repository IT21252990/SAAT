import React, { useState, useEffect } from "react";
import axios from "axios";

const ContributorCommitHistory = ({ repoUrl }) => {
  const [contributors, setContributors] = useState([]);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [commitHistory, setCommitHistory] = useState([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    contributorList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      padding: 0,
      listStyleType: "none",
    },
    contributorItem: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      border: "1px solid #ccc",
      borderRadius: "5px",
      padding: "10px",
      transition: "background-color 0.3s",
    },
    contributorItemHover: {
      backgroundColor: "#f1f1f1",
    },
    contributorImage: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      marginRight: "10px",
    },
    commitsContainer: {
      marginTop: "20px",
    },
    commitItem: {
      marginBottom: "15px",
      padding: "10px",
      border: "1px solid #ddd",
      borderRadius: "5px",
    },
    commitLink: {
      color: "#007bff",
      textDecoration: "none",
    },
    pagination: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px",
    },
    error: {
      color: "red",
      marginBottom: "10px",
    },
  };

  useEffect(() => {
    const fetchContributors = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/repo/contributors`,
          { params: { repo_url: repoUrl } }
        );
        setContributors(response.data);
      } catch {
        setError("Failed to fetch contributors data.");
      }
    };

    if (repoUrl) fetchContributors();
  }, [repoUrl]);

  const fetchCommitHistory = async (contributorLogin, page = 1) => {
    setError(null);
    setCommitHistory([]);
    setTotalCommits(0);
    setSelectedContributor(contributorLogin);
    setCurrentPage(page);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/repo/commits`,
        {
          params: {
            repo_url: repoUrl,
            contributor_login: contributorLogin,
            page,
          },
        }
      );
      // setCommitHistory(response.data.commits);
      setCommitHistory(
        Array.isArray(response.data.commits) ? response.data.commits : []
      );
      setTotalCommits(response.data.total_commits || 0);
      setPagination(response.data.pagination || {});
    } catch {
      setError("Failed to fetch commit history.");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Contributors</h2>
      {error && <p style={styles.error}>{error}</p>}
      <ul style={styles.contributorList}>
        {contributors.map((contributor) => (
          <li
            key={contributor.id}
            style={styles.contributorItem}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f1f1f1")
            }
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "")}
            onClick={() => fetchCommitHistory(contributor.login)}
          >
            <img
              src={contributor.avatar_url}
              alt={`${contributor.login}'s avatar`}
              style={styles.contributorImage}
            />
            <span>
              {contributor.login} (Commits: {contributor.contributions})
            </span>
          </li>
        ))}
      </ul>

      {selectedContributor && (
        <div style={styles.commitsContainer}>
          <h3>
            Commit History for <span>{selectedContributor}</span>
          </h3>
          <p>
            <strong>Total Commits:</strong> {totalCommits}
          </p>
          {!commitHistory || commitHistory.length === 0 ? (
            <p>No commits found or loading...</p>
          ) : (
            <ul>
              {commitHistory.map((commit) => (
                <li key={commit.sha} style={styles.commitItem}>
                  <p>
                    <strong>Message:</strong>{" "}
                    {commit.commit?.message || "No message"}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {commit.commit?.author?.date
                      ? new Date(commit.commit.author.date).toLocaleString()
                      : "No date available"}
                  </p>
                  <p>
                    <a
                      href={commit.html_url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.commitLink}
                    >
                      View Commit
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          )}

          <div style={styles.pagination}>
            {pagination.prev && (
              <button
                onClick={() =>
                  fetchCommitHistory(
                    selectedContributor,
                    new URLSearchParams(pagination.prev).get("page")
                  )
                }
              >
                Previous
              </button>
            )}
            <span>Page: {currentPage}</span>
            {pagination.next && (
              <button
                onClick={() =>
                  fetchCommitHistory(
                    selectedContributor,
                    new URLSearchParams(pagination.next).get("page")
                  )
                }
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorCommitHistory;
