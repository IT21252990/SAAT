import React from "react";
import { useNavigate } from "react-router-dom";
import heroGif from "../src/asserts/hero.gif";
import Header from "./components/Header";

function App() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <div className="flex-none">
        <Header />
      </div>
      <section className=" w-full h-screen mx-auto p-6 bg-white dark:bg-gray-800 shadow-md">
        <div className="mx-auto grid max-w-screen-xl px-4 lg:grid-cols-12 lg:gap-8 xl:gap-0">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1 className="mb-10 mt-10 max-w-2xl text-4xl font-extrabold leading-none tracking-tight dark:text-white md:text-5xl xl:text-6xl">
              Welcome to S A A T
            </h1>
            <p className="mb-6 mt-10 max-w-2xl font-semibold text-gray-500 dark:text-gray-400 md:text-lg lg:mb-8 lg:text-xl">
              Smart Assignment Assessment Tool<br />
              An automated platform for easy submission and assessment of student coursework
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:focus:ring-primary-900 inline-flex items-center justify-center rounded-lg px-5 py-3 text-center text-base font-medium text-white focus:ring-4"
              >
                Login
                <svg
                  className="-mr-1 ml-2 h-5 w-5"
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
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-3 text-center text-base font-medium text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-800"
              >
                Register
              </button>
            </div>
          </div>
          <div className="hidden lg:col-span-5 lg:flex items-center justify-center">
            <img src={heroGif} alt="mockup" className="rounded-3xl max-h-[80vh]" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
