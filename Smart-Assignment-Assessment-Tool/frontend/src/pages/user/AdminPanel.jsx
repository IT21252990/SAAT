import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import Header from "../../components/Header";

// Icons 
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const IdIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("students");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    studentName: "",
    email: "",
    role: "teacher", // Fixed role
    password: "",
    confirmPassword: ""
});

const [errors, setErrors] = useState({});
  const [semesterFilter, setSemesterFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/getAllUsers`);
        const data = await response.json();
        console.log("Fetched users:", data);
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch users");
        }

        // Ensure data is an array before setting it
        if (!Array.isArray(data.users)) {
        throw new Error("Invalid data format: expected array of users");
        }
        
        setUsers(data.users || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

const filteredUsers = users.filter(user => {
  const matchesSearch = 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.studentName && user.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
  
  const matchesRole = 
    (activeTab === "students" && user.role === "student") ||
    (activeTab === "lecturers" && user.role === "teacher") ||
    (activeTab === "admins" && user.role === "admin");
  
  const matchesSemester = !semesterFilter || user.academicSemester === semesterFilter;
  const matchesYear = !yearFilter || user.academicYear === yearFilter;
  
  return matchesSearch && matchesRole && matchesSemester && matchesYear;
});

const uniqueSemesters = [...new Set(users
  .filter(user => user.role === "student" && user.academicSemester)
  .map(user => user.academicSemester)
)].sort();

const uniqueYears = [...new Set(users
  .filter(user => user.role === "student" && user.academicYear)
  .map(user => user.academicYear)
)].sort();

  // Handle new user input changes
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Validate new user form
  const validateNewUser = () => {
    const newErrors = {};

    if (!newUser.studentName.trim()) {
        newErrors.studentName = "Teacher name is required";
    }

    if (!newUser.email.trim()) {
        newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
        newErrors.email = "Please enter a valid email address";
    }

    if (!newUser.password) {
        newErrors.password = "Password is required";
    } else if (newUser.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
    }

    if (newUser.password !== newUser.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    };

  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!validateNewUser()) {
        return;
    }

    try {

        const userCredential = await createUserWithEmailAndPassword(
                auth,
                newUser.email,
                newUser.password
              );
              const user = userCredential.user;

        const userData = {
            uid : user.uid, 
        studentName: newUser.studentName.trim(),
        email: newUser.email.trim(),
        role: "teacher", // Always teacher
        password: newUser.password
        };

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/registerteacher`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(userData),
        });

        const responseData = await response.json();
        console.log("Response from server:", responseData);

        if (!response.ok) {
        throw new Error(responseData.error || "Failed to add teacher");
        }

        // Add the new teacher to the local state
        setUsers(prev => [...prev, responseData]);
        
        // Reset form and close modal
        setNewUser({
        studentName: "",
        email: "",
        role: "teacher",
        password: "",
        confirmPassword: ""
        });
        setShowAddUserModal(false);
        
    } catch (error) {
        console.error("Error adding teacher:", error);
        setErrors({ general: error.message });
    }
    };

  // Delete user
 const handleDeleteUser = async (user) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        // Use uid if available, otherwise fall back to _id
        const userId = user.uid || user._id;
        
        if (!userId) {
          throw new Error("User ID not found");
        }

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/deleteUser/${userId}`, {
          method: "DELETE",
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to delete user");
        }

        // Remove the user from the local state using the correct identifier
        setUsers(prev => prev.filter(u => (u.uid || u._id) !== userId));

        // Show success message (optional)
        console.log("User deleted successfully:", responseData.message);

      } catch (error) {
        console.error("Error deleting user:", error);
        setError(error.message);
        
        // Clear error after 5 seconds
        setTimeout(() => setError(null), 5000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>
      
      <div className="container px-4 pt-16 pb-5 mx-auto">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage system users and settings
            </p>
          </div>

          {/* Main Dashboard Content */}
          <div className="bg-white shadow-lg dark:bg-gray-800 rounded-xl">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("students")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "students"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Students
                </button>
                <button
                  onClick={() => setActiveTab("lecturers")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "lecturers"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Lecturers
                </button>
                <button
                  onClick={() => setActiveTab("admins")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "admins"
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  Administrators
                </button>
              </nav>
            </div>

            {/* Search and Add User */}
            <div className="flex flex-col items-start justify-between p-4 space-y-4 md:flex-row md:items-center md:space-y-0">
                <div className="flex flex-col w-full space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:w-auto">
                    <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full py-2 pl-10 pr-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500/30 dark:text-white"
                    />
                    </div>
    
    {activeTab === "students" && (
      <>
        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500/30 dark:text-white md:w-40"
        >
          <option value="">All Semesters</option>
          {uniqueSemesters.map(semester => (
            <option key={semester} value={semester}>{semester}</option>
          ))}
        </select>
        
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-500/30 dark:text-white md:w-32"
        >
          <option value="">All Years</option>
          {uniqueYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </>
    )}
  </div>
  
  <button
    onClick={() => setShowAddUserModal(true)}
    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto"
  >
    Add New User
  </button>
</div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <svg className="w-8 h-8 mr-3 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-gray-500">Loading users...</span>
                </div>
              ) : error ? (
                <div className="p-4 m-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-800 dark:text-red-200">
                      {error}
                    </span>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No users found matching your criteria
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
  <tr>
    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
      Name
    </th>
    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
      Email
    </th>
    {activeTab === "students" && (
      <>
        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
          Student ID
        </th>
        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
          Student Name
        </th>
        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
          Semester
        </th>
        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
          Academic Year
        </th>
        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
      Actions
    </th>
      </>
    )}
    {activeTab === "lecturers" && (
      <>
        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
          Lecture Name
        </th>
        <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
      Actions
    </th>
      </>
    )}
    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300">
      Role
    </th>
  </tr>
</thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
  {filteredUsers.map((user) => (
    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-600">
            {user.profilePicUrl ? (
              <img 
                src={user.profilePicUrl} 
                alt={user.name || user.studentName || "User"} 
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <UserIcon />
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
      </td>
      {activeTab === "students" && (
        <>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 dark:text-white">{user.studentId || "N/A"}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 dark:text-white">{user.studentName || "N/A"}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 dark:text-white">{user.academicSemester || "N/A"}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 dark:text-white">{user.academicYear || "N/A"}</div>
          </td>
          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
        <button
          onClick={() => handleDeleteUser(user)}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Delete
        </button>
      </td>
        </>
      )}
      {activeTab === "lecturers" && (
        <>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900 dark:text-white">{user.studentName || "N/A"}</div>
          </td>
          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
        <button
          onClick={() => handleDeleteUser(user)}
          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
        >
          Delete
        </button>
      </td>
        </>
      )}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.role === "admin"
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            : user.role === "lecturer" || user.role === "teacher"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        }`}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
        </span>
      </td>
      
    </tr>
  ))}
</tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Add New User
                </h3>
                <button
  onClick={() => setShowAddUserModal(true)}
  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto"
>
  Add New Teacher
</button>
              </div>

              {errors.general && (
                <div className="p-4 mb-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-red-800 dark:text-red-200">
                      {errors.general}
                    </span>
                  </div>
                </div>
              )}

            <form onSubmit={handleAddUser} className="space-y-4">
  <div className="space-y-2">
    <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Teacher Name <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
        <UserIcon />
      </div>
      <input
        type="text"
        name="studentName"
        id="studentName"
        value={newUser.studentName}
        onChange={handleNewUserChange}
        className={`block w-full px-3 py-2.5 pl-10 border rounded-lg text-sm ${
          errors.studentName
            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
            : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
        }`}
        placeholder="John Doe"
        required
      />
    </div>
    {errors.studentName && (
      <p className="text-sm text-red-600 dark:text-red-400">
        {errors.studentName}
      </p>
    )}
  </div>

  <div className="space-y-2">
    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Email <span className="text-red-500">*</span>
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
        <EmailIcon />
      </div>
      <input
        type="email"
        name="email"
        id="email"
        value={newUser.email}
        onChange={handleNewUserChange}
        className={`block w-full px-3 py-2.5 pl-10 border rounded-lg text-sm ${
          errors.email
            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
            : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
        }`}
        placeholder="teacher@example.com"
        required
      />
    </div>
    {errors.email && (
      <p className="text-sm text-red-600 dark:text-red-400">
        {errors.email}
      </p>
    )}
  </div>

  {/* Remove the role selector since it's always teacher */}

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div className="space-y-2">
      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Password <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
          <LockIcon />
        </div>
        <input
          type="password"
          name="password"
          id="password"
          value={newUser.password}
          onChange={handleNewUserChange}
          className={`block w-full px-3 py-2.5 pl-10 border rounded-lg text-sm ${
            errors.password
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
          }`}
          placeholder="••••••••"
          required
        />
      </div>
      {errors.password && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.password}
        </p>
      )}
    </div>

    <div className="space-y-2">
      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Confirm Password <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
          <LockIcon />
        </div>
        <input
          type="password"
          name="confirmPassword"
          id="confirmPassword"
          value={newUser.confirmPassword}
          onChange={handleNewUserChange}
          className={`block w-full px-3 py-2.5 pl-10 border rounded-lg text-sm ${
            errors.confirmPassword
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
          }`}
          placeholder="••••••••"
          required
        />
      </div>
      {errors.confirmPassword && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors.confirmPassword}
        </p>
      )}
    </div>
  </div>

  <div className="flex justify-end pt-4 space-x-3">
    <button
      type="button"
      onClick={() => setShowAddUserModal(false)}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      Add Teacher
    </button>
  </div>
</form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;