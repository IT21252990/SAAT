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
    <div className="max-w-7xl mx-auto p-5 font-sans from-primary-50 to-white dark:from-gray-800 min-h-screen">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-white dark:bg-gray-700 hover:bg-primary-50 dark:hover:bg-gray-600 rounded-lg inline-flex items-center transition-all duration-300 shadow-sm hover:shadow border border-gray-200 dark:border-gray-600 text-primary-700 dark:text-primary-300"
      >
        <svg
          className="w-4 h-4 mr-2"
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <img
              src={contributor.avatar_url}
              alt={`${contributor.login}'s avatar`}
              className="w-20 h-20 rounded-full ring-4 ring-primary-100 dark:ring-primary-900"
            />
            <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              #{totalCommits}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
              {contributor.login}
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"></path>
                </svg>
                {totalCommits} Commits
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                {totalAdditions} Additions
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                <svg 
                  className="w-4 h-4 mr-1" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                </svg>
                {totalDeletions} Deletions
              </span>
            </div>
          </div>
        </div>

        {/* Contribution Activity Graph */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <svg 
              className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
            </svg>
            Contribution Activity
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner">
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
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="week" 
                  stroke="#6B7280" 
                  fontSize={12}
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#6B7280" 
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "0.5rem",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    padding: "0.75rem",
                  }}
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(label) => {
                    const item = activityData.find(
                      (item) => item.week === label
                    );
                    return `${label} (${item?.date || ""})`;
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "10px" }}
                  iconType="circle"
                />
                <Line
                  type="monotone"
                  dataKey="commits"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: "#1D4ED8" }}
                  name="Commits"
                />
                <Line
                  type="monotone"
                  dataKey="additions"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: "#059669" }}
                  name="Additions"
                />
                <Line
                  type="monotone"
                  dataKey="deletions"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: "#B91C1C" }}
                  name="Deletions"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Commits</div>
                <div className="text-xl font-bold text-primary-700 dark:text-primary-400">{totalCommits.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Additions</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{totalAdditions.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Deletions</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{totalDeletions.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <svg 
            className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd"></path>
          </svg>
          Commit History
        </h3>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300 flex items-start">
            <svg 
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-500 dark:text-gray-400">Loading commits...</span>
          </div>
        ) : !commitHistory || commitHistory.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <svg 
              className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No commits found for this contributor.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {commitHistory.map((commit) => (
              <li
                key={commit.sha}
                className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/70 transition-colors duration-300 shadow-sm hover:shadow"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 font-medium break-words">
                      {commit.commit?.message || "No message"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                    {commit.commit?.author?.date
                      ? new Date(commit.commit.author.date).toLocaleString()
                      : "No date available"}
                  </div>
                </div>
                <div className="flex flex-wrap justify-between items-center">
                  <div className="flex items-center">
                    <img 
                      src={commit.author?.avatar_url || contributor.avatar_url} 
                      alt="Author" 
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {commit.commit?.author?.name || commit.author?.login || contributor.login}
                    </span>
                  </div>
                  <a
                    href={commit.html_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline inline-flex items-center mt-2 sm:mt-0"
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
                </div>
              </li>
            ))}
          </ul>
        )}

        {(pagination.prev || pagination.next) && (
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
            <button
              onClick={() => handlePagination("prev")}
              disabled={!pagination.prev}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center justify-center w-full sm:w-auto ${
                pagination.prev
                  ? "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 shadow-sm hover:shadow transition-all duration-300"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg 
                className="w-4 h-4 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Previous
            </button>
            <span className="text-gray-600 dark:text-gray-300 font-medium px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              Page {currentPage}
            </span>
            <button
              onClick={() => handlePagination("next")}
              disabled={!pagination.next}
              className={`px-5 py-2.5 rounded-lg font-medium flex items-center justify-center w-full sm:w-auto ${
                pagination.next
                  ? "bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 shadow-sm hover:shadow transition-all duration-300"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              Next
              <svg 
                className="w-4 h-4 ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributorDetails;