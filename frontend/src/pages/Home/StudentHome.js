import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleFetchModules = async () => {
    if (!year || !semester) {
      setError("Please select both Year and Semester.");
      return;
    }

    try {
      setError(""); // Clear any previous errors

      const response = await fetch(
        `http://127.0.0.1:5000/module/getModulesByYearSemester?year=${year}&semester=${semester}`
      );
      const data = await response.json();

      if (response.ok) {
        setModules(data.modules);
      } else {
        setError(data.error || "Something went wrong!");
      }
    } catch (error) {
      setError("Failed to fetch modules: " + error.message);
    }
  };

  const handleModuleClick = (moduleId) => {
    navigate(`/module-page/${moduleId}`); // Redirect to assignments page
  };

  return (
    <div className="container">
      <h1> Student Home</h1>
      <h2>Select Year & Semester</h2>

      {/* Year Dropdown */}
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="">Select Year</option>
        <option value="1">1st Year</option>
        <option value="2">2nd Year</option>
        <option value="3">3rd Year</option>
        <option value="4">4th Year</option>
      </select>

      {/* Semester Dropdown */}
      <select value={semester} onChange={(e) => setSemester(e.target.value)}>
        <option value="">Select Semester</option>
        <option value="1">1st Semester</option>
        <option value="2">2nd Semester</option>
      </select>

      {/* Fetch Modules Button */}
      <button onClick={handleFetchModules}>Get Modules</button>

      {/* Display Error Message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Display Modules */}
      {modules.length > 0 && (
        <div>
          <h3>Available Modules</h3>
          <ul>
            {modules.map((mod) => (
              <li
                key={mod.module_id}
                onClick={() => handleModuleClick(mod.module_id)}
              >
                {mod.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StudentHome;
