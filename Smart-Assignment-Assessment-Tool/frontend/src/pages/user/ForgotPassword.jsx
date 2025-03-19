// import React, { useState } from "react";
// import { auth, googleProvider } from "../../firebase";
// import { useNavigate } from "react-router-dom";

// const ForgotPassword = () => {


//   return (
//     <div>
//       <h2>Forgot Password</h2>
//     </div>
//   );
// };

// export default ForgotPassword;


import React, { useState } from "react";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
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
      <div className="flex-none">
        <Header />
      </div>
      <section className="relative flex items-center justify-center flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 animate-slide-in-right">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Reset Password
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We'll send you a link to reset your password
            </p>
          </div>
          
          <div className="p-8 mt-8 transition-all duration-300 bg-white shadow-2xl rounded-xl dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-primary-500/10">
            {!emailSent ? (
              <div className="space-y-6">
                <h2 className="flex items-center text-xl font-bold text-gray-900 dark:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Forgot Password
                </h2>
                
                {error && (
                  <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
                    <span className="font-medium">Error:</span> {error}
                  </div>
                )}
                
                <form className="space-y-5" onSubmit={handleResetPassword}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                        </svg>
                      </div>
                      <input
                        type="email"
                        onChange={(e) => setEmail(e.target.value)}
                        name="email"
                        id="email"
                        className="block w-full p-3 pl-10 text-sm text-gray-900 transition-all duration-200 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`group relative flex w-full justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 transition-all duration-200 transform hover:-translate-y-1 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-primary-400 group-hover:text-primary-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {isSubmitting ? 'Sending...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="py-8 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="p-3 bg-green-100 rounded-full dark:bg-green-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Check your email</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a password reset link to <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Don't see it? Check your spam folder or try another email address.
                </p>
              </div>
            )}
            
            <div className="pt-5 mt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                <a
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center font-medium transition-colors cursor-pointer text-primary-600 hover:text-primary-500 dark:text-primary-500 dark:hover:text-primary-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;