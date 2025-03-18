import React, { useState, useEffect } from "react";
import axios from "axios";
import ContributorDetails from "./ContributorDetails";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, Alert, Spinner } from "flowbite-react";

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
          { params: { repo_url: repoUrl } },
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

  const renderCustomLabel = ({ x, y, width, height, index }) => {
    const contributor = contributors[index];
    if (!contributor) return null;

    return (
      <svg x={x + width / 2 - 25} y={y - 55} width={50} height={50}>
        <defs>
          <clipPath id={`clip-${index}`}>
            <circle cx="25" cy="25" r="25" />
          </clipPath>
        </defs>
        <image
          href={contributor.avatar_url}
          width="50"
          height="50"
          clipPath={`url(#clip-${index})`}
        />
      </svg>
    );
  };

  if (selectedContributor) {
    return (
      <ContributorDetails
        contributor={selectedContributor}
        repoUrl={repoUrl}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="mx-auto max-w-full p-5 font-sans">
      <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
        Contributors
      </h2>
      {error && <p className="mb-3 text-red-600">{error}</p>}
      {loading && (
        <div className="flex items-center justify-center p-12">
          <Spinner size="xl" />
          <span className="text-primary-600 dark:text-primary-400 ml-3">
            Loading Contribution details...
          </span>
        </div>
      )}

      <ul className="grid w-full grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow dark:border dark:border-gray-700 dark:bg-gray-800 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {contributors.map((contributor) => (
          <li
            key={contributor.id}
            className="flex cursor-pointer items-center rounded-lg border border-gray-200 bg-gray-400 p-3 transition-colors duration-300 hover:bg-gray-100"
            onClick={() => handleContributorClick(contributor)}
          >
            <img
              src={contributor.avatar_url}
              alt={`${contributor.login}'s avatar`}
              className="mr-3 h-10 w-10 rounded-full"
            />
            <span className="font-bold text-black">{contributor.login} </span>
          </li>
        ))}
      </ul>

      {!loading && contributors.length === 0 && !error && (
        <p className="text-gray-500">
          No contributors found for this repository.
        </p>
      )}

      {contributors.length > 0 && (
        <div className="mt-8 rounded-lg bg-white p-4 shadow-lg">
          <h3 className="mb-3 text-xl font-semibold text-gray-800">
            Contribution Chart
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={contributors}
              margin={{ top: 40, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <pattern
                  id="linePattern"
                  patternUnits="userSpaceOnUse"
                  width="6"
                  height="6"
                >
                  <path d="M 0,6 L 6,0" stroke="#1e40af" strokeWidth="2" />
                </pattern>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="login" tick={{ fill: "#2563eb" }} />
              <YAxis />
              <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.1)" }} />
              <Bar
                dataKey="contributions"
                fill="url(#linePattern)"
                radius={[8, 8, 0, 0]}
                label={renderCustomLabel}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ContributorCommitHistory;
