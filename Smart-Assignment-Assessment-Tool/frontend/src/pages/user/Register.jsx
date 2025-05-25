import React, { useState } from "react";
import { auth } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const Register = () => {
  const [formData, setFormData] = useState({
    studentName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
    academicYear: "",
    academicSemester: "",
    termsAccepted: false
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const academicYears = ["Year 1", "Year 2", "Year 3", "Year 4"];
  const academicSemesters = ["Semester 1", "Semester 2"];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Student Name validation
    if (!formData.studentName.trim()) {
      newErrors.studentName = "Student name is required";
    } else if (formData.studentName.trim().length < 2) {
      newErrors.studentName = "Student name must be at least 2 characters";
    }

    // Student ID validation
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    } else if (!/^[A-Za-z0-9]{10}$/.test(formData.studentId.trim())) {
      newErrors.studentId = "Student ID must be 10 alphanumeric characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Academic Year validation
    if (!formData.academicYear) {
      newErrors.academicYear = "Academic year is required";
    }

    // Academic Semester validation
    if (!formData.academicSemester) {
      newErrors.academicSemester = "Academic semester is required";
    }

    // Terms acceptance validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Prepare user data for backend - ensure all required fields are present and properly formatted
      const userData = {
        uid: user.uid,
        email: user.email,
        role: "student",
        studentName: formData.studentName.trim(),
        studentId: formData.studentId.trim(),
        academicYear: formData.academicYear,
        academicSemester: formData.academicSemester,
        createdAt: new Date().toISOString()
      };

      console.log('Sending data to backend:', userData);

      // Save user data to backend
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/registerStudent`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();
      console.log('Backend response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to save user data");
      }

      // Show success message
      setErrors({ success: "Registration successful! Redirecting..." });
      
      // In a real app, you would navigate to student home
      setTimeout(() => {
        navigate("/student-home");
      }, 1000);

    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.message.includes('email-already-in-use')) {
        errorMessage = "This email is already registered. Please use a different email.";
      } else if (error.message.includes('weak-password')) {
        errorMessage = "Password is too weak. Please choose a stronger password.";
      } else if (error.message.includes('invalid-email')) {
        errorMessage = "Invalid email address.";
      } else if (error.message.includes('Student ID already exists')) {
        errorMessage = "This Student ID is already registered. Please check your Student ID.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };


  // Icon components
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
    </svg>
  );

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

  const CheckIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );

  const BookIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );

  // Reusable Select Field Component
  const SelectField = ({ label, name, options, placeholder, icon: Icon, required = true }) => (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <Icon />
          </div>
        )}
        <select
          name={name}
          id={name}
          value={formData[name]}
          onChange={handleInputChange}
          className={`
            block w-full px-3 py-2.5 border rounded-lg text-sm
            ${Icon ? "pl-10" : "pl-3"}
            pr-8
            ${errors[name]
              ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
              : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
            }
            transition-colors duration-200 focus:outline-none focus:ring-4
            text-gray-900 dark:text-white
          `}
          required={required}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {errors[name] && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
          <Header />
      </div>
      
      <div className="container px-4 pt-16 pb-5 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-2 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              Welcome!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create your student account to get started
            </p>
          </div>

          {/* Registration Form */}
          <div className="px-8 py-2 bg-white shadow-lg dark:bg-gray-800 rounded-xl">
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Personal Information */}
              <div className="space-y-4"> 
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Student Name Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="studentName"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                        <UserIcon />
                      </div>
                      <input
                        type="text"
                        name="studentName"
                        id="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        className={`
                          block w-full px-3 py-2.5 pl-10 border rounded-lg text-sm
                          ${errors.studentName
                            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
                            : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                          }
                          transition-colors duration-200 focus:outline-none focus:ring-4
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        `}
                        placeholder="Jayathilaka A.G.K.D"
                        required
                      />
                    </div>
                    {errors.studentName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.studentName}
                      </p>
                    )}
                  </div>

                  {/* Student ID Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="studentId"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Student ID <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                        <IdIcon />
                      </div>
                      <input
                        type="text"
                        name="studentId"
                        id="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className={`
                          block w-full px-3 py-2.5 pl-10 border rounded-lg text-sm
                          ${errors.studentId
                            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
                            : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                          }
                          transition-colors duration-200 focus:outline-none focus:ring-4
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        `}
                        placeholder="IT12345678"
                        required
                      />
                    </div>
                    {errors.studentId && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.studentId}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SelectField
                    label="Academic Year"
                    name="academicYear"
                    options={academicYears}
                    placeholder="Select academic year"
                    icon={CalendarIcon}
                  />
                  
                  <SelectField
                    label="Academic Semester"
                    name="academicSemester"
                    options={academicSemesters}
                    placeholder="Select semester"
                    icon={BookIcon}
                  />
                </div>
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                      <EmailIcon />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`
                        block w-full px-3 py-2.5 pl-10 border rounded-lg text-sm
                        ${errors.email
                          ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
                          : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                        }
                        transition-colors duration-200 focus:outline-none focus:ring-4
                        text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                      `}
                      placeholder="it12345678@my.sliit.lk"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                        <LockIcon />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`
                          block w-full px-3 py-2.5 pl-10 pr-10 border rounded-lg text-sm
                          ${errors.password
                            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
                            : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                          }
                          transition-colors duration-200 focus:outline-none focus:ring-4
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        `}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                        <CheckIcon />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`
                          block w-full px-3 py-2.5 pl-10 pr-10 border rounded-lg text-sm
                          ${errors.confirmPassword
                            ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:bg-red-900/20 dark:focus:ring-red-800/30"
                            : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:focus:border-blue-400 dark:focus:ring-blue-800/30"
                          }
                          transition-colors duration-200 focus:outline-none focus:ring-4
                          text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                        `}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="termsAccepted"
                      name="termsAccepted"
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      className={`w-4 h-4 rounded border focus:ring-2 transition-colors ${
                        errors.termsAccepted
                          ? "border-red-500 text-red-600 focus:ring-red-200"
                          : "border-gray-300 text-blue-600 focus:ring-blue-200"
                      } bg-gray-50 dark:bg-gray-700`}
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="termsAccepted"
                      className={`text-sm ${
                        errors.termsAccepted 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      I accept the{" "}
                      <button
                        type="button"
                        className="text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
                        onClick={() => {/* Handle terms modal */}}
                      >
                        Terms and Conditions
                      </button>
                      {" "}<span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
                {errors.termsAccepted && (
                  <p className="text-sm text-red-600 dark:text-red-400 ml-7">
                    {errors.termsAccepted}
                  </p>
                )}
              </div>

              {/* General Error */}
              {errors.general && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium text-sm transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Student Account"
                )}
              </button>

              {/* Login Link */}
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
                >
                  Login here
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;