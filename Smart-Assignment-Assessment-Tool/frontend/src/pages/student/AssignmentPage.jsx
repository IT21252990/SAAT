import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AssignmentDetails from "../../components/AssignmentDetails.jsx";
import generatePDF from "../../components/PDFGenerator.jsx";
import Header from "../../components/Header.jsx";
import thumbsUp from "../../asserts/Thumbs-up.gif";

const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId, moduleName } = location.state || {}; // Retrieve passed state
  const [assignment, setAssignment] = useState(null);
  const [marking, setMarking] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Retrieve studentId from localStorage
  const studentId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`,
        );

        const responseMarking = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/marking-scheme/markingScheme/${assignmentId}`,
        );

        const data = await response.json();
        const dataMarking = await responseMarking.json();

        if (response.ok) {
          setAssignment(data);
        } else {
          setError(data.error || "Assignment not found!");
        }

        if (responseMarking.ok) {
          setMarking(dataMarking);
          console.log(dataMarking)
        } else {
          setError(dataMarking.error || "Marking not found!");
        }
      } catch (error) {
        setError("Failed to fetch assignment: " + error.message);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleSubmitClick = () => {
    if (!studentId) {
      setError("User not logged in. Please log in again.");
      return;
    }

    navigate(`/add-submission/${assignmentId}`, {
      state: {
        assignmentId,
        moduleId,
        moduleName,
      },
    });
  };

  return (
    <>
      <Header />
      {/* Main container with flex-row for side-by-side layout */}
      <div className="mt-4 flex w-full max-w-7xl flex-row gap-6 p-6">
        {/* Assignment Box */}
        <div className="flex-1 rounded-lg border border-gray-200 p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="flex-1">
            {error ? (
              <p className="text-red-500">{error}</p>
            ) : assignment ? (
              <>
                <AssignmentDetails assignment={assignment} moduleName={moduleName} />

                {/* Marking Scheme Table */}
                {marking && marking.marking_schemes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                      Marking Scheme for report submission
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-200 dark:bg-gray-700">
                          <tr>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                              Criterion
                            </th>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                              Low Description
                            </th>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                              High Description
                            </th>
                            <th className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                              Weightage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {marking.marking_schemes[0].criteria.map((criterion, index) => (
                            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {criterion.criterion}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {criterion.low_description}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {criterion.high_description}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 dark:border-gray-600">
                                {criterion.weightage}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p>Loading assignment details...</p>
            )}
          </div>
        </div>


        {/* Submission Box */}
        <div className="sticky top-6 h-fit w-80 rounded-lg border border-gray-200 bg-white p-10 shadow-md dark:border-gray-600 dark:bg-gray-700">
          <h3 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
            Submit Your Work Here !{" "}
          </h3>
          {/* Thumbs-up GIF */}
          <div className="mb-5">
            <img src={thumbsUp} alt="Thumbs Up" className="mx-auto w-28" />
          </div>
          <button
            onClick={handleSubmitClick}
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-lg text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {loading ? "Processing..." : "Upload Submission"}
          </button>

            <hr className="my-10 h-px w-full border-0 bg-gray-200 dark:bg-gray-200 dark:bg-opacity-80" />

            <button
              onClick={() => generatePDF(assignment, moduleName)}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-800"
            >
              Download Assignment <br />
              as a PDF 📩
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignmentPage;
