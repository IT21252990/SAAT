import React, { useState, useEffect } from "react";
import axios from "axios";

const DisplayAssignmentDetails = ({ codeID }) => {
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

  
  

  return (
    <div >
      
    </div>
  );
};

export default DisplayAssignmentDetails;
