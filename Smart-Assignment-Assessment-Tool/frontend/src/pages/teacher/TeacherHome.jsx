import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import {
  Card,
  Button,
  Label,
  Select,
  TextInput,
  Modal,
  Spinner,
  Badge,
  Tooltip,
} from "flowbite-react";
import {
  HiAcademicCap,
  HiCalendar,
  HiPlus,
  HiViewGrid,
  HiClipboardList,
  HiUsers,
  HiChartBar,
  HiDocumentSearch,
  HiEye,
  HiOutlineRefresh,
} from "react-icons/hi";

const TeacherHome = () => {
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [modules, setModules] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
      setError("Please select both Year and Semester to view your modules.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/module/getModulesByYearSemester?year=${year}&semester=${semester}`,
      );
      const data = await response.json();
      if (response.ok) {
        setModules(data.modules);
        if (data.modules.length === 0) {
          setError("No modules found for the selected year and semester.");
        }
      } else {
        setError(data.error || "Something went wrong while fetching modules!");
      }
    } catch (error) {
      setError("Failed to fetch modules: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch modules automatically when year or semester changes
  useEffect(() => {
    if (year && semester) {
      handleFetchModules();
    }
  }, [year, semester]);

  const handleModuleClick = (moduleId) => {
    navigate(`/teacher-module-page/${moduleId}`);
  };

  const handleAddNewModule = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Reset form and errors
    setNewModule({ name: "", year: "", semester: "", enroll_key: "" });
    setError("");
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
      year: Number(newModule.year),
      semester: Number(newModule.semester),
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/module/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(moduleData),
        },
      );
      const data = await response.json();
      if (response.ok) {
        setModules([...modules, data.module]);
        setShowModal(false);
        setNewModule({ name: "", year: "", semester: "", enroll_key: "" });
      } else {
        setError(data.error || "Failed to create module");
      }
    } catch (error) {
      setError("Failed to create module: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get year label
  const getYearLabel = (yearValue) => {
    const yearMap = {
      1: "1st Year",
      2: "2nd Year",
      3: "3rd Year",
      4: "4th Year",
    };
    return yearMap[yearValue] || yearValue;
  };

  // Helper function to get semester label
  const getSemesterLabel = (semValue) => {
    return semValue === "1" ? "1st Semester" : "2nd Semester";
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>
      <div className="container px-4 pt-16 pb-5 mx-auto">
        <div className="mb-3 text-center">
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text dark:from-primary-400 dark:to-primary-300">
            Teacher Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your modules, assignments, and student progress in one place
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left sidebar with filters */}
          <Card className="overflow-hidden border-none shadow-lg lg:col-span-1">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                  <HiViewGrid className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Filter Modules
                </h2>
              </div>

              <p className="mb-5 text-sm text-gray-600 dark:text-gray-400">
                Select academic year and semester to view relevant modules
              </p>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="year"
                    value="Academic Year"
                    className="block mb-2 text-gray-700 dark:text-gray-300"
                  />
                  <Select
                    id="year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </Select>
                </div>

                <div>
                  <Label
                    htmlFor="semester"
                    value="Semester"
                    className="block mb-2 text-gray-700 dark:text-gray-300"
                  />
                  <Select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    required
                    className="border-gray-300 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600"
                  >
                    <option value="">Select Semester</option>
                    <option value="1">1st Semester</option>
                    <option value="2">2nd Semester</option>
                  </Select>
                </div>

                <Button
                  color="primary"
                  onClick={handleFetchModules}
                  className="w-full mt-2 transition-all duration-300 shadow-md bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <HiOutlineRefresh className="w-5 h-5 mr-2" />
                      View Modules
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 transition duration-300 rounded-lg opacity-75 bg-gradient-to-r from-green-400 to-green-600 group-hover:duration-200"></div>
                  <Button
                    color="success"
                    onClick={handleAddNewModule}
                    className="relative w-full mt-4 transition-all duration-300 shadow-md bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg"
                  >
                    <HiPlus className="w-5 h-5 mr-2" /> Add New Module
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Main content area */}
          <Card className="border-none shadow-lg lg:col-span-2">
            <div className="p-5">
              <div className="flex items-center gap-3 -mt-5">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                  <HiAcademicCap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Your Modules
                </h2>
              </div>

              {error && (
                <div className="p-4 mt-4 text-red-800 bg-red-100 border-l-4 border-red-500 rounded-lg animate-slide-in-right dark:bg-red-900 dark:text-red-200">
                  {error}
                </div>
              )}

              {loading && !error && (
                <div className="flex items-center justify-center h-60">
                  <div className="text-center">
                    <Spinner size="xl" className="mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Loading your modules...
                    </p>
                  </div>
                </div>
              )}

              {!loading &&
                !error &&
                modules.length === 0 &&
                year &&
                semester && (
                  <div className="p-5 mt-4 text-blue-800 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900 dark:text-blue-200">
                    <div className="flex items-center">
                      <HiClipboardList className="w-8 h-8 mr-3" />
                      <div>
                        <p className="font-medium">
                          No modules found for {getYearLabel(year)},{" "}
                          {getSemesterLabel(semester)}.
                        </p>
                        <p className="mt-1 text-sm">
                          Click "Add New Module" to create one.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {!loading &&
                !error &&
                modules.length === 0 &&
                (!year || !semester) && (
                  <div className="p-5 mt-4 text-blue-800 border-l-4 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900 dark:text-blue-200">
                    <div className="flex items-center">
                      <div className="mr-4 text-4xl animate-bounce">👈</div>
                      <div>
                        <p className="font-medium">
                          Please select both Year and Semester from the filters
                          on the left.
                        </p>
                        <p className="mt-1 text-sm">
                          Your modules will appear here.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {modules.length > 0 && (
                <div className="grid grid-cols-1 gap-5 mt-6 md:grid-cols-2">
                  {modules.map((mod) => (
                    <div
                      key={mod.module_id}
                      className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-sm group rounded-xl hover:border-primary-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500"
                    >
                      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50 dark:border-gray-700 dark:from-gray-700 dark:to-gray-700">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 dark:text-white">
                            {mod.name}
                          </h3>
                          <Badge
                            color="info"
                            className="animate-slide-in-right"
                          >
                            {getYearLabel(mod.year)} •{" "}
                            {getSemesterLabel(mod.semester)}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="mx-10 my-4 ">
                          <Button
                            color="primary"
                            size="sm"
                            onClick={() => handleModuleClick(mod.module_id)}
                            className="w-full transition-all duration-300 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 group-hover:shadow-md"
                          >
                            <HiEye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modal to add new module */}
      <Modal show={showModal} onClose={handleModalClose} popup size="md">
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="inline-flex p-2 mx-auto mb-3 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400">
              <HiAcademicCap className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Create New Module
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Fill in the details to create a new teaching module
            </p>
          </div>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleModuleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" value="Module Name" />
              <TextInput
                id="name"
                name="name"
                placeholder="e.g., Introduction to Programming"
                value={newModule.name}
                onChange={handleInputChange}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year" value="Year" />
                <Select
                  id="year"
                  name="year"
                  value={newModule.year}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                >
                  <option value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="semester" value="Semester" />
                <Select
                  id="semester"
                  name="semester"
                  value={newModule.semester}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                >
                  <option value="">Select Semester</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="enroll_key" value="Enrollment Key" />
              <TextInput
                id="enroll_key"
                name="enroll_key"
                placeholder="Create a unique enrollment key for students"
                value={newModule.enroll_key}
                onChange={handleInputChange}
                required
                className="mt-1"
                helperText="Students will use this key to enroll in your module"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
                {error}
              </div>
            )}

            <div className="flex justify-between gap-4 mt-6">
              <Button
                color="gray"
                onClick={handleModalClose}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <HiPlus className="w-4 h-4 mr-2" />
                    Create Module
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TeacherHome;
