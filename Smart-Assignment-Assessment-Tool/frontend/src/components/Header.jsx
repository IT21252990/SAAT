import React, { useEffect, useState } from "react";
import { DarkThemeToggle } from "flowbite-react";
import { auth } from "../firebase.jsx";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../asserts/rounded_logo.png";

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Header = () => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch user role from Firestore
        fetchUserRole(currentUser.uid);
      } else {
        setUserRole(null);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Function to fetch user role from Firestore
  const fetchUserRole = async (uid) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/getUser/${uid}`);
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
        setUserDetails(userData);
      } else {
        console.error("Failed to fetch user role");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userId"); // Clear stored user ID
      setUserRole(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle logo click based on user role
  const handleLogoClick = (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/");
    } else if (userRole === "teacher") {
      navigate("/teacher-home");
    } else if (userRole === "student") {
      navigate("/student-home");
    } else if (userRole === "admin") {
      navigate("/admin-panel");
    } else {
      // Default case if role is not recognized
      navigate("/");
    }
  };

  return (
    <header className="relative w-full">
      <DarkThemeToggle className="absolute p-3 text-blue-500 top-2 right-4 dark:text-yellow-300" />
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between max-w-screen-xl mx-auto">
          {/* Logo with custom click handler */}
          <a href="#" onClick={handleLogoClick} className="flex items-center">
            <img src={logo} className="h-6 mr-3 sm:h-9" alt="Saat Logo" />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              S A A T
            </span>
          </a>

          <div className="flex items-center lg:order-2">
            {userDetails ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-600">
                  {userDetails.profilePicUrl ? (
                    <img 
                      src={userDetails.profilePicUrl} 
                      alt={userDetails.studentName || "User"} 
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <UserIcon />
                  )}
                </div>
                {/* Display User Email */}
                <span className="mr-4 text-gray-700 dark:text-gray-300">
                  {userDetails.studentName ? userDetails.studentName : userDetails.email}
                </span>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="text-white bg-primary-700 mr-10 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <a
                onClick={() => navigate("/register")}
                className="text-white mr-10 cursor-pointer bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
              >
                Get Started
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;