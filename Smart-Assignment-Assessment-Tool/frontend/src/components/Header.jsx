import React, { useEffect, useState } from "react";
import { DarkThemeToggle } from "flowbite-react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import logo from "../asserts/rounded_logo.png";

const Header = () => {
  const [user, setUser] = useState(null);
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
            {user ? (
              <div className="flex items-center">
                {/* Display User Email */}
                <span className="mr-4 text-gray-700 dark:text-gray-300">
                  {user.email}
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