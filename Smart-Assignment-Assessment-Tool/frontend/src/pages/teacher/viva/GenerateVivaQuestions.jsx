import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header";

const GenerateVivaQuestions = () => {
  const { submissionId } = useParams();
  const [selectedContent, setSelectedContent] = useState(null);
  const [step, setStep] = useState(1);
  const [metrics, setMetrics] = useState([]);

  const defaultMetrics = {
    general: [
      "Conceptual Understanding",
      "Problem-Solving Approach",
      "Justification & Reflection",
    ],
    code: ["Functionality", "Code Structure", "Error Handling"],
    video: ["Clarity of Explanation", "Demonstration of Work"],
    report: ["Technical Accuracy", "Analysis & Justification"],
  };

  const handleButtonClick = (content) => {
    setSelectedContent(content);
    setMetrics(defaultMetrics[content] || []);
    setStep(2);
  };

  const handleMetricChange = (index, newValue) => {
    const newMetrics = [...metrics];
    newMetrics[index] = newValue;
    setMetrics(newMetrics);
  };

  const handleAddMetric = () => setMetrics([...metrics, ""]);
  const handleRemoveMetric = (index) =>
    setMetrics(metrics.filter((_, i) => i !== index));

  const generateQuestions = async () => {
    try {
      // Define the payload to send to the API
      const requestData = {
        submission_id: submissionId,
        metric_types: metrics,
      };

      // Set API URL based on the selected content
      let apiUrl;
      if (selectedContent === "general") {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/qgenerate/generateGeneralQuestions`;
      } else if (selectedContent === "code") {
        apiUrl = `${import.meta.env.VITE_BACKEND_URL}/qgenerate/generateCodeQuestions`; 
      } else if (selectedContent === "video") {
        apiUrl = "/api/generateVideoQuestions";
      } else if (selectedContent === "report") {
        apiUrl = "/api/generateReportQuestions";
      }

      // Send the POST request
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      // Parse response and handle it
      const data = await response.json();

      if (response.ok) {
        // Handle successful response (display questions)
        console.log("Generated Questions:", data);
        // Here you can update the state with the generated questions to display them
      } else {
        // Handle errors
        console.error("Error generating questions:", data.error);
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mt-10 w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Generate Viva Questions
        </h2>

        {/* Stepper */}
        <ol className="mt-6 flex w-full items-center text-center text-sm font-medium text-gray-500 dark:text-gray-400 sm:text-base">
          <li className="after:border-1 flex items-center text-blue-600 after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:border-gray-200 dark:text-blue-500 dark:after:border-gray-700 sm:after:inline-block sm:after:content-[''] md:w-full xl:after:mx-10">
            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
              <svg
                className="me-2.5 h-3.5 w-3.5 sm:h-4 sm:w-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
              </svg>
              Question Type
            </span>
          </li>
          <li className="after:border-1 flex items-center after:mx-6 after:hidden after:h-1 after:w-full after:border-b after:content-[''] dark:after:border-gray-700 sm:after:inline-block md:w-full xl:after:mx-10">
            <span className="flex items-center after:mx-2 after:text-gray-200 after:content-['/'] dark:after:text-gray-500 sm:after:hidden">
              <span className="me-2">2</span> Metrics
            </span>
          </li>
          <li className="flex items-center">
            <span className="me-2">3</span> Generate Questions
          </li>
        </ol>

        {/* Step 1: Buttons for question types */}
        {step === 1 && (
          <div className="my-6 rounded-md bg-gray-50 p-6 pb-10 dark:bg-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              What type of questions do you need to generate?
            </h3>
            <div className="mt-8 grid grid-cols-2 gap-6">
              {["general", "code", "video", "report"].map((type) => (
                <button
                  key={type}
                  className={`rounded-lg px-6 py-4 text-center text-white ${type === "general" ? "bg-cyan-700" : type === "code" ? "bg-sky-700" : type === "video" ? "bg-teal-700" : "bg-blue-700"}`}
                  onClick={() => handleButtonClick(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Metrics */}
        {step === 2 && selectedContent && (
          <div className="mt-6 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Select Evaluation Metrics for{" "}
              {selectedContent.charAt(0).toUpperCase() +
                selectedContent.slice(1)}{" "}
              questions 🧾
            </h3>
            <p className="mb-4 text-base text-gray-900 dark:text-gray-400">
              Pick from the available metrics or add custom ones to evaluate the
              student
            </p>
            <div className="mt-4 space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    value={metric}
                    onChange={(e) => handleMetricChange(index, e.target.value)}
                    className="ml-10 h-10 w-2/3 rounded-md border px-4 py-2 dark:border-gray-500 dark:bg-gray-600 dark:text-white"
                    placeholder="Enter metric"
                  />
                  <button
                    className="rounded-md border border-red-700 px-2 py-1 text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                    onClick={() => handleRemoveMetric(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="ml-10 mt-4 rounded-md border border-green-700 px-4 py-1 font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-800"
                onClick={handleAddMetric}
              >
                + Add New Metric
              </button>
            </div>
            <div className="mt-6 text-center">
              <button
                className="rounded-md bg-blue-600 px-6 py-2 font-medium text-white"
                onClick={() => setStep(3)}
              >
                Done ✔
              </button>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Click here to generate questions
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Generate Questions */}
        {step === 3 && (
          <div className="mt-6 rounded-md bg-gray-50 p-4 dark:bg-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Generate Viva Questions
            </h3>
            <button
              className="rounded-lg bg-blue-600 px-6 py-3 text-white"
              onClick={generateQuestions} // Call the function when clicked
            >
              Generate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateVivaQuestions;
