import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroGif from "../src/asserts/hero.gif";
import Header from "./components/Header";

function App() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Background pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-primary-200 dark:text-gray-700" />
        </svg>
      </div>

      <div className="relative z-10 flex-none">
        <Header />
      </div>
      
      <section className="relative z-10 flex-grow w-full">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:grid-cols-12 lg:gap-8 xl:gap-0">
          <div className={`mr-auto place-self-center lg:col-span-7 transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center px-4 py-2 mb-6 text-sm font-medium rounded-full text-primary-700 bg-primary-100 dark:bg-primary-900 dark:text-primary-300">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
              <span>Trusted by educators worldwide</span>
            </div>
            
            <h1 className="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl xl:text-6xl">
              Transform Education with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500">SAAT</span>
            </h1>
            
            <p className="max-w-2xl mb-4 font-semibold text-gray-500 dark:text-gray-400 md:text-lg lg:text-xl">
              Smart Assignment Assessment Tool
            </p>
            
            <p className="max-w-2xl mb-6 text-gray-600 dark:text-gray-300 md:text-lg">
              Revolutionize your assessment workflow with AI-powered evaluation of student reports, code repositories, and video presentations. Save time while providing more detailed, objective feedback for your students.
            </p>
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900 transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Get Started
                <svg
                  className="w-5 h-5 ml-2 -mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <button
                onClick={() => navigate("/register")}
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800 transition-all duration-300 ease-in-out"
              >
                Learn More
              </button>
            </div>
            
            <div className="flex items-center mt-8">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`flex items-center justify-center w-10 h-10 text-xs font-bold text-white border-2 border-white rounded-full dark:border-gray-800 bg-primary-600`}>
                    {["S", "A", "A", "T"][i-1]}
                  </div>
                ))}
              </div>
              <span className="ml-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Join thousands of educators and students
              </span>
            </div>
          </div>
          
          <div className={`hidden lg:col-span-5 lg:flex items-center justify-center transition-all duration-1000 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0 translate-x-10'}`}>
            <div className="relative">
              <div className="absolute opacity-75 -inset-1 bg-gradient-to-r from-primary-600 to-primary-400 rounded-3xl blur-md"></div>
              <img 
                src={heroGif} 
                alt="SAAT platform preview" 
                className="relative object-cover rounded-3xl max-h-[80vh] shadow-2xl" 
              />
              <div className="absolute p-3 bg-white rounded-lg shadow-lg -bottom-4 -right-4 dark:bg-gray-800">
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white">Live Grading</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="max-w-screen-xl px-4 py-12 mx-auto mt-8">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-900 dark:text-white">Advanced Assessment Capabilities</h2>
          <div className="grid grid-cols-1 gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 transition-all duration-300 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg hover:transform hover:scale-105">
              <div className="w-12 h-12 p-3 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">Code Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">Static code analysis evaluates quality, conventions, patterns, and structure in GitHub repositories</p>
            </div>
            <div className="p-6 transition-all duration-300 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg hover:transform hover:scale-105">
              <div className="w-12 h-12 p-3 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">Video Processing</h3>
              <p className="text-gray-600 dark:text-gray-400">Generate annotations, extract audio, and create transcripts for comprehensive video assessment</p>
            </div>
            <div className="p-6 transition-all duration-300 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg hover:transform hover:scale-105">
              <div className="w-12 h-12 p-3 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">NLP Report Analysis</h3>
              <p className="text-gray-600 dark:text-gray-400">Natural language processing checks completeness, segments content, and highlights improvement areas</p>
            </div>
            <div className="p-6 transition-all duration-300 bg-white rounded-lg shadow-md dark:bg-gray-800 hover:shadow-lg hover:transform hover:scale-105">
              <div className="w-12 h-12 p-3 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900">
                <svg className="w-6 h-6 text-primary-600 dark:text-primary-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">AI-Generated Viva Questions</h3>
              <p className="text-gray-600 dark:text-gray-400">LLM-powered question generation based on submitted work for thorough understanding assessment</p>
            </div>
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="max-w-screen-xl px-4 py-12 mx-auto mt-12 rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-900 dark:text-white">Benefits for Educators & Students</h2>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
              <h3 className="flex items-center mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
                For Educators
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Save time with automated initial assessment and feedback generation
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Ensure fair and consistent evaluation criteria across all submissions
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Generate relevant viva questions to verify understanding and detect academic dishonesty
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Streamlined assignment creation and management workflow
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-700">
              <h3 className="flex items-center mb-4 text-xl font-bold text-primary-600 dark:text-primary-400">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
                For Students
              </h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Receive detailed, objective feedback on submissions
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  User-friendly submission portal for various formats (reports, code, videos)
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Real-time tracking of submission status and feedback
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mt-1 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  Improved learning outcomes through comprehensive assessment
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Technologies Section */}
        <div className="max-w-screen-xl px-4 py-12 mx-auto mt-12">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-900 dark:text-white">Powered by Advanced Technologies</h2>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="p-4 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM10.03 8l-1 4h2.938l1-4H10.03z" clipRule="evenodd"></path>
              </svg>
              <p className="font-medium text-gray-800 dark:text-white">AI & ML</p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd"></path>
              </svg>
              <p className="font-medium text-gray-800 dark:text-white">NLP</p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
              </svg>
              <p className="font-medium text-gray-800 dark:text-white">Code Repository Analysis</p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
              </svg>
              <p className="font-medium text-gray-800 dark:text-white">Video Processing</p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.354 18 4.92 18h10.16c2.566 0 4.103-3.231 2.396-5.231l-4-4A1 1 0 0113 7.172V4.414l.707-.707A1 1 0 0013 2H7z" clipRule="evenodd"></path>
              </svg>
              <p className="font-medium text-gray-800 dark:text-white">LLM Integration</p>
            </div>
            <div className="p-4 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
              <svg className="w-8 h-8 mx-auto mb-2 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
              </svg>
              <p className="font-medium text-gray-800 dark:text-white">API Integration</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <div className="relative z-10 w-full px-4 py-12 mx-auto mt-8 text-center bg-primary-100 dark:bg-primary-900">
        <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">Ready to transform your assessment workflow?</h2>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">Join educators worldwide who are saving time and providing better feedback with SAAT</p>
        <button
          onClick={() => navigate("/register")}
          className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 ease-in-out rounded-lg bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
        >
          Get Started Today
          <svg
            className="w-5 h-5 ml-2 -mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 p-4 bg-white dark:bg-gray-900">
        <div className="max-w-screen-xl mx-auto text-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SAAT - Smart Assignment Assessment Tool. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;