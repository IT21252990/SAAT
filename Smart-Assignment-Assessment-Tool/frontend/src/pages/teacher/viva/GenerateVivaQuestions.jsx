import React from "react";
import { useParams } from "react-router-dom";
import Header from "../../../components/Header";

const GenerateVivaQuestions = () => {
  const { submissionId } = useParams();

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mt-10 w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Generate Viva Questions
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Generating viva questions for submission ID: <strong>{submissionId}</strong>
        </p>
      </div>
    </div>
  );
};

export default GenerateVivaQuestions;
