import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ContributorDetails = ({ contributor, repoUrl, onBack }) => {
  const [commitHistory, setCommitHistory] = useState([]);
  const [totalCommits, setTotalCommits] = useState(
    contributor?.contributions || 0
  );
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [totalAdditions, setTotalAdditions] = useState(0);
  const [totalDeletions, setTotalDeletions] = useState(0);

  useEffect(() => {
    if (!contributor || !repoUrl) {
      setError("Missing contributor information.");
      return;
    }
    fetchContributorActivity();
    fetchCommitHistory(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributor, repoUrl]);

  const fetchCommitHistory = async (page = 1) => {
    setError(null);
    setCommitHistory([]);
    setLoading(true);
    setCurrentPage(page);

    try {
      console.log(`Fetching commits for: ${contributor.login}, page: ${page}`);

      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/commits`,
        {
          params: {
            repo_url: repoUrl,
            contributor_login: contributor.login,
            page,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.commits) {
        setCommitHistory(response.data.commits);
        setPagination(response.data.pagination || {});
      } else {
        console.error("Invalid response format:", response.data);
        setError("Invalid response format from server.");
      }
    } catch (err) {
      console.error("Error fetching commits:", err);
      setError(`Failed to fetch commit history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchContributorActivity = async () => {
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/repo/contributor-activity`,
        {
          params: {
            repo_url: repoUrl,
            contributor_login: contributor.login,
          },
        }
      );

      if (response.data && response.data.activity_data) {
        setActivityData(response.data.activity_data);
        setTotalCommits(response.data.total_commits);
        setTotalAdditions(response.data.total_additions);
        setTotalDeletions(response.data.total_deletions);
      } else if (response.data && response.data.message) {
        setError(response.data.message);
        setActivityData([]);
        setTotalCommits(0);
        setTotalAdditions(0);
        setTotalDeletions(0);
      } else {
        console.error("Invalid activity data format:", response.data);
        setError("Invalid activity data format from server.");
      }
    } catch (err) {
      console.error("Error fetching activity data:", err);
      setError(`Failed to fetch activity data: ${err.message}`);
    }
  };

  const handlePagination = (direction) => {
    let newPage;
    if (direction === "prev") {
      newPage = pagination.prev
        ? Number(new URLSearchParams(pagination.prev).get("page"))
        : currentPage - 1;
    } else {
      newPage = pagination.next
        ? Number(new URLSearchParams(pagination.next).get("page"))
        : currentPage + 1;
    }

    fetchCommitHistory(newPage);
  };

  return (
    <div className="max-w-4xl mx-auto p-5 font-sans">
      <button
        onClick={onBack}
        className="mb-4 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg inline-flex items-center"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Contributors
      </button>

      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex items-center mb-4">
          <img
            src={contributor.avatar_url}
            alt={`${contributor.login}'s avatar`}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {contributor.login}
            </h2>
            <p className="text-gray-600">
              <span className="font-medium">Total Commits:</span> {totalCommits}
            </p>
          </div>
        </div>

        {/* Contribution Activity Graph */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Contribution Activity
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={activityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const item = activityData.find(
                      (item) => item.week === label
                    );
                    return `${label} (${item?.date || ""})`;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="commits"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  name="Commits"
                />
                <Line
                  type="monotone"
                  dataKey="additions"
                  stroke="#82ca9d"
                  name="Additions"
                />
                <Line
                  type="monotone"
                  dataKey="deletions"
                  stroke="#ff8042"
                  name="Deletions"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="mt-2"> Total Additions: {totalAdditions}</p>
            <p> Total Deletions: {totalDeletions}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Commit History
        </h3>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        {loading ? (
          <p className="mt-3 text-gray-500 italic">Loading commits...</p>
        ) : !commitHistory || commitHistory.length === 0 ? (
          <p className="mt-3 text-gray-500">
            No commits found for this contributor.
          </p>
        ) : (
          <ul className="space-y-4">
            {commitHistory.map((commit) => (
              <li
                key={commit.sha}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="mb-2">
                  <span className="font-medium">Message:</span>{" "}
                  <span className="text-gray-700">
                    {commit.commit?.message || "No message"}
                  </span>
                </p>
                <p className="mb-2 text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {commit.commit?.author?.date
                    ? new Date(commit.commit.author.date).toLocaleString()
                    : "No date available"}
                </p>
                <a
                  href={commit.html_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center"
                >
                  View Commit
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    ></path>
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        )}

        {(pagination.prev || pagination.next) && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => handlePagination("prev")}
              disabled={!pagination.prev}
              className={`px-4 py-2 rounded-lg font-medium ${
                pagination.prev
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <span className="text-gray-600">Page: {currentPage}</span>
            <button
              onClick={() => handlePagination("next")}
              disabled={!pagination.next}
              className={`px-4 py-2 rounded-lg font-medium ${
                pagination.next
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributorDetails;
