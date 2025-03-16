import React from "react";

const AssignmentDetails = ({ assignment, moduleName }) => {
  return (
    <div >
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {assignment.name}
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        <strong>Module:</strong> {moduleName || "Unknown Module"}
      </p>
      <p className="text-gray-700 dark:text-gray-300 mt-2">
        <strong>Assignment Description:</strong> {assignment.description}
      </p>
      <p className="text-gray-700 dark:text-gray-300 mt-2">
        <strong>Deadline:</strong> {assignment.deadline}
      </p>

      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
        Assignment Details
      </h3>
      {assignment.details && assignment.details.length > 0 ? (
        assignment.details.map((detail, index) => (
          <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 mt-4">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              {detail.topic}
            </h4>
            <p className="text-gray-700 dark:text-gray-300 mt-1">{detail.description}</p>
            {detail.subtopics && detail.subtopics.length > 0 && (
              <div className="ml-4 mt-2">
                {detail.subtopics.map((subtopic, subIndex) => (
                  <div key={subIndex} className="p-2 border-l-4 border-gray-400 dark:border-gray-500">
                    <p className="font-medium text-gray-800 dark:text-white">{subtopic.topic}</p>
                    <p className="text-gray-600 dark:text-gray-300">{subtopic.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No assignment details available.</p>
      )}

      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-6 mb-2">
        Marking Criteria
      </h3>
      {assignment.marking_criteria && Object.keys(assignment.marking_criteria).length > 0 ? (
        Object.entries(assignment.marking_criteria).map(([type, criteria], index) => (
          <div key={index} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 mt-4">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria:
            </h4>
            {criteria && criteria.length > 0 ? (
              <ul className="list-disc list-inside mt-2">
                {criteria.map((item, subIndex) => (
                  <li key={subIndex} className="text-gray-700 dark:text-gray-300">
                    <strong>{item.criteria}:</strong> {item.allocated_mark} marks
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">No criteria available for this submission type.</p>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No marking criteria available.</p>
      )}
    </div>
  );
};

export default AssignmentDetails;

