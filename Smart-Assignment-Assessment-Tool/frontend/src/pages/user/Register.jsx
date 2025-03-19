import React, { useState } from "react";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Save role in Firestore using Flask API
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/saveUser`, {
        method: "POST",
        body: JSON.stringify({ uid: user.uid, email: user.email, role }),
        headers: { "Content-Type": "application/json" },
      });

      // Redirect based on role
      navigate(role === "student" ? "/student-home" : "/teacher-home");
    } catch (error) {
      setError(error.message);
    }
  };

  const eyeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5 text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );

  const eyeOffIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-5 h-5 text-gray-500 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-500"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
            className="text-primary-200 dark:text-gray-700"
          />
        </svg>
      </div>
      <div className="flex-none">
        <Header />
      </div>
      <section className="relative flex items-center justify-center flex-grow px-4 pt-3 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-2 animate-slide-in-right">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Welcome!
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Create your account to get started
            </p>
          </div>

          <div className="p-8 mt-0 transition-all duration-300 bg-white shadow-2xl rounded-xl hover:shadow-primary-500/10 dark:border dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-3">
              <form className="space-y-5" onSubmit={handleRegister}>
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700 transition-colors group-focus-within:text-primary-600 dark:text-gray-300 dark:group-focus-within:text-primary-400"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      onChange={(e) => setEmail(e.target.value)}
                      name="email"
                      id="email"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
                      placeholder="name@company.com"
                      required=""
                    />
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-700 transition-colors group-focus-within:text-primary-600 dark:text-gray-300 dark:group-focus-within:text-primary-400"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      onChange={(e) => setPassword(e.target.value)}
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 pr-10 text-gray-900 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
                      required=""
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? eyeOffIcon : eyeIcon}
                    </button>
                  </div>
                </div>

                <div className="group">
                  <label
                    htmlFor="user_role"
                    className="block mb-2 text-sm font-medium text-gray-700 transition-colors group-focus-within:text-primary-600 dark:text-gray-300 dark:group-focus-within:text-primary-400"
                  >
                    I am a
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <select
                      id="user_role"
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      aria-describedby="terms"
                      type="checkbox"
                      className="w-4 h-4 transition-colors border border-gray-300 rounded focus:ring-3 bg-gray-50 focus:ring-primary-300 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600"
                      required=""
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="terms"
                      className="font-light text-gray-500 dark:text-gray-300"
                    >
                      I accept the{" "}
                      <a
                        className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                        href="#"
                      >
                        Terms and Conditions
                      </a>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-700 dark:text-red-400">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-5 py-3 text-sm font-medium text-center text-white transition-all rounded-lg bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Create an account
                </button>

                <p className="text-sm font-light text-center text-gray-500 dark:text-gray-400">
                  Already have an account?{" "}
                  <a
                    onClick={() => navigate("/login")}
                    className="font-medium cursor-pointer text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Login here
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
