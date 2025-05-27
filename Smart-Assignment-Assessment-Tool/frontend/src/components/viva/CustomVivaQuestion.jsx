import React, { useState } from 'react';
import { useToast } from "../../contexts/ToastContext";

const AddCustomQuestionModal = ({ 
  isOpen, 
  onClose, 
  selectedContent, 
  submissionId 
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const {showToast} = useToast();

  const generateCustomAnswer = async () => {
    if (!customQuestion.trim()) {
      showToast("Please enter a question", "error");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Fetch submission content from backend
      // const contentRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/qgenerate/GenerateAnswerForCustomQuestions`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     submissionId,
      //     submissionType: selectedContent,
      //   }),
      // });

      // if (!contentRes.ok) throw new Error("Failed to fetch submission content");

      // const { content } = await contentRes.json();

      // Step 2: Call Gemini with question + fetched content
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/qgenerate/GenerateAnswerForCustomQuestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: customQuestion,
          submissionType: selectedContent,
          submissionId: submissionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate answer");

      const data = await response.json();
      setGeneratedAnswer(data.answer || "No answer generated.");
    } catch (error) {
      console.error("Error:", error);
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCustomQuestion('');
    setGeneratedAnswer('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Custom Question</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Your Question
            </label>
            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Enter your custom question here..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {generatedAnswer && (
            <div>
              <h4 className="mb-2 font-semibold text-gray-800 dark:text-gray-200">Generated Answer:</h4>
              <p className="p-3 text-sm text-gray-700 bg-gray-100 rounded dark:bg-gray-700 dark:text-white">
                {generatedAnswer}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Close
          </button>
          <button
            onClick={generateCustomAnswer}
            disabled={!customQuestion.trim() || loading}
            className={`inline-flex items-center px-4 py-2 text-white rounded-lg ${
              !customQuestion.trim() || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              "Generate Answer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomQuestionModal;
