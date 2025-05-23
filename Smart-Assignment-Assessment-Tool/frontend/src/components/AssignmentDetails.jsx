import React from "react";

const AssignmentDetails = ({ assignment, moduleName, marking }) => {

  console.log(marking)
  return (
    <div>
      <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
        {assignment.name}
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        <strong>Module:</strong> {moduleName || "Unknown Module"}
      </p>
      <p className="mt-2 text-gray-700 dark:text-gray-300">
        <strong>Assignment Description:</strong> {assignment.description}
      </p>
      <p className="mt-2 text-gray-700 dark:text-gray-300">
        <strong>Deadline:</strong> {assignment.deadline}
      </p>

      <h3 className="mb-2 mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Assignment Details
      </h3>
      {assignment.details && assignment.details.length > 0 ? (
        assignment.details.map((detail, index) => (
          <div
            key={index}
            className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
          >
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              {detail.topic}
            </h4>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {detail.description}
            </p>
            {detail.subtopics && detail.subtopics.length > 0 && (
              <div className="ml-4 mt-2">
                {detail.subtopics.map((subtopic, subIndex) => (
                  <div
                    key={subIndex}
                    className="border-l-4 border-gray-400 p-2 dark:border-gray-500"
                  >
                    <p className="font-medium text-gray-800 dark:text-white">
                      {subtopic.topic}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      {subtopic.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No assignment details available.
        </p>
      )}

    <h3 className="mb-2 mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
      Deliverables
    </h3>
    {assignment.submission_types ? (
      <ul className="mb-4 list-disc list-inside text-gray-700 dark:text-gray-300">
        {Object.entries(assignment.submission_types)
          .filter(([type, isAccepted]) => isAccepted)
          .map(([type], index) => (
            <li key={index} className="capitalize">
              {type}
            </li>
          ))}
      </ul>
    ) : (
      <p className="text-gray-600 dark:text-gray-400">No submission types specified.</p>
    )}


    <h3 className="mb-2 mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
      Deliverables
    </h3>
    {assignment.submission_types ? (
      <ul className="mb-4 list-disc list-inside text-gray-700 dark:text-gray-300">
        {Object.entries(assignment.submission_types)
          .filter(([type, isAccepted]) => isAccepted)
          .map(([type], index) => (
            <li key={index} className="capitalize">
              {type}
            </li>
          ))}
      </ul>
    ) : (
      <p className="text-gray-600 dark:text-gray-400">No submission types specified.</p>
    )}


      <h3 className="mb-2 mt-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Marking Criteria
      </h3>
      {assignment.marking_criteria &&
      Object.keys(assignment.marking_criteria).some(
        (key) => assignment.marking_criteria[key]?.length > 0
      ) ? (
        Object.entries(assignment.marking_criteria).map(([type, criteria], index) =>
          criteria && criteria.length > 0 ? (
            <div
              key={index}
              className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
            >
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria:
              </h4>
              <ul className="mt-2 list-inside list-disc">
                {criteria.map((item, subIndex) => (
                  <li
                    key={subIndex}
                    className="text-gray-700 dark:text-gray-300"
                  >
                    <strong>{item.criteria}:</strong> {item.allocated_mark} marks
                  </li>
                ))}
              </ul>
            </div>
          ) : null
        )
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          No marking criteria available.
        </p>
      )}
  
    </div>
  );
};

export default AssignmentDetails;