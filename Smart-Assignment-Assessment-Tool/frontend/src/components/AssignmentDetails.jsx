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
  Marking Criteria
</h3>
{assignment.marking_criteria &&
Object.keys(assignment.marking_criteria).length > 0 ? (
  Object.entries(assignment.marking_criteria)
    .filter(([type]) => type === 'report')
    .map(([type, criteria], index) => (
      <div
        key={index}
        className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
      >
        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
          {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria:
        </h4>

        {marking.criteria && marking.criteria.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border border-gray-300 dark:border-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                    Criteria
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                    Low Condition
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                    High Condition
                  </th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 dark:border-gray-600 dark:text-white">
                    Weightage (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {marking.criteria.map((item, subIndex) => (
                  <tr
                    key={subIndex}
                    className="even:bg-gray-50 dark:even:bg-gray-700"
                  >
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                      {item.criterion}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                      {item.low_description || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                      {item.high_description || 'N/A'}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 dark:border-gray-600 dark:text-gray-300">
                      {item.weightage || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            No criteria available for this submission type.
          </p>
        )}
      </div>
    ))
) : (
  <p className="text-gray-600 dark:text-gray-400">
    No marking criteria available.
  </p>
)}



{assignment.marking_criteria &&
  Object.keys(assignment.marking_criteria).length > 0 ? (
    Object.entries(assignment.marking_criteria).map(([type, criteria], index) =>
      type !== "report" ? (
        <div
          key={index}
          className="mt-4 rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700"
        >
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria:
          </h4>
          {criteria && criteria.length > 0 ? (
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
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              No criteria available for this submission type.
            </p>
          )}
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