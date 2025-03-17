import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

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
        `${import.meta.env.VITE_BACKEND_URL}/module/getModulesByYearSemester?year=${year}&semester=${semester}`
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
    <div className="h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mt-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-800 dark:text-white">
          Hello Student ! 👩🏻‍🎓
        </h1>
        <h2 className="mb-4 text-center text-lg text-gray-600 dark:text-gray-100">
          Select your year & semester to View Modules. .
        </h2>
        
        <div className="mb-4 flex flex-col space-y-2">
          <select
            className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:text-white"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">Select Year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>

          <select
            className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:text-white"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            <option value="">Select Semester</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
          </select>
        </div>

        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <button
          onClick={handleFetchModules}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          View Modules
        </button>

        {modules.length > 0 && (
          <div className="mt-6">
            <h3 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
              Available Modules
            </h3>
            <ul className="mt-2 space-y-2">
              {modules.map((mod) => (
                <li
                  key={mod.module_id}
                  onClick={() => handleModuleClick(mod.module_id)}
                  className="cursor-pointer rounded-lg bg-gray-200 p-3 text-center text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                >
                  {mod.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentHome;
