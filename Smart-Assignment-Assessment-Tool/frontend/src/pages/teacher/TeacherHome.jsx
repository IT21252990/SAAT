import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const TeacherHome = () => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [newModule, setNewModule] = useState({
    name: "",
    year: "",
    semester: "",
    enroll_key: "",
  });
  const navigate = useNavigate();

  // Function to fetch modules based on selected year and semester
  const handleFetchModules = async () => {
    if (!year || !semester) {
      setError("Please select both Year and Semester.");
      return;
    }

    try {
      setError("");
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

  // useEffect hook to fetch modules automatically when year or semester changes
  useEffect(() => {
    if (year && semester) {
      handleFetchModules();
    }
  }, [year, semester]); // Re-run whenever year or semester changes

  const handleModuleClick = (moduleId) => {
    navigate(`/teacher-module-page/${moduleId}`);
  };

  const handleAddNewModule = () => {
    setShowModal(true); // Show modal when button is clicked
  };

  const handleModalClose = () => {
    setShowModal(false); // Close modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewModule((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    // Convert year and semester to numbers before submitting
    const moduleData = {
      ...newModule,
      year: Number(newModule.year), // Convert year to number
      semester: Number(newModule.semester), // Convert semester to number
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/module/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(moduleData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setModules([...modules, data.module]); // Add the new module to the list
        setShowModal(false); // Close the modal
        setNewModule({ name: "", year: "", semester: "", enroll_key: "" }); // Reset form
      } else {
        setError(data.error || "Failed to create module");
      }
    } catch (error) {
      setError("Failed to create module: " + error.message);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900">

      <Header />

      <div className=" mt-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h1 className="mb-4 text-center text-2xl font-semibold text-gray-800 dark:text-white">
          Hello Teacher! 👩🏻‍🏫
        </h1>
        <h2 className="mb-4 text-center text-lg text-gray-600 dark:text-gray-100">
          Select Year & Semester to View Modules
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

        {/* Add New Module Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleAddNewModule}
            className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            Add New Module
          </button>
        </div>
      </div>

      {/* Modal to add new module */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg dark:bg-gray-800">
            <h2 className="text-center text-xl font-semibold text-gray-800 dark:text-white">
              Add New Module
            </h2>
            <form onSubmit={handleModuleSubmit} className="mt-4 space-y-4">
              <input
                type="text"
                name="name"
                value={newModule.name}
                onChange={handleInputChange}
                placeholder="Module Name"
                className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="number"
                name="year"
                value={newModule.year}
                onChange={handleInputChange}
                placeholder="Year"
                className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="number"
                name="semester"
                value={newModule.semester}
                onChange={handleInputChange}
                placeholder="Semester"
                className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="text"
                name="enroll_key"
                value={newModule.enroll_key}
                onChange={handleInputChange}
                placeholder="Enrollment Key"
                className="w-full rounded-lg border p-2 dark:bg-gray-700 dark:text-white"
                required
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Module
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherHome;
