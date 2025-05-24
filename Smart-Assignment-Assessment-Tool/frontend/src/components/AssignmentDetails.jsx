import React from "react";

const AssignmentDetails = ({ assignment, moduleName, marking }) => {
  // Helper function to render criteria table
  const renderCriteriaTable = (criteria, type) => {
    if (!criteria || criteria.length === 0) return null;

    // Get the weight for this submission type
    const typeWeight = marking?.submission_type_weights?.[type] || 
                      assignment?.submission_type_weights?.[type] || 
                      0;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria
          </h4>
          {typeWeight > 0 && (
            <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
              {typeWeight}% of total grade
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 font-semibold text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                  Criteria
                </th>
                <th className="px-4 py-2 font-semibold text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                  Low
                </th>
                <th className="px-4 py-2 font-semibold text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                  Medium
                </th>
                <th className="px-4 py-2 font-semibold text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                  High
                </th>
                <th className="px-4 py-2 font-semibold text-left text-gray-900 border border-gray-300 dark:border-gray-600 dark:text-white">
                  Weightage
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                    {criterion.criterion}
                  </td>
                  <td className="px-4 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                    {criterion.low_description || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                    {criterion.medium_description || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                    {criterion.high_description || 'N/A'}
                  </td>
                  <td className="px-4 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 dark:text-gray-300">
                    {criterion.weightage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper function to render simple criteria list (for non-rubric criteria)
  const renderSimpleCriteriaList = (criteria, type) => {
    if (!criteria || criteria.length === 0) return null;

    // Get the weight for this submission type
    const typeWeight = assignment?.submission_type_weights?.[type] || 0;

    return (
      <div className="p-4 mt-4 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria
          </h4>
          {typeWeight > 0 && (
            <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
              {typeWeight}% of total grade
            </span>
          )}
        </div>
        <ul className="mt-2 list-disc list-inside">
          {criteria.map((item, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              <strong>{item.criteria}:</strong> {item.allocated_mark} marks
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Calculate total weight for enabled submission types
  const calculateTotalWeight = () => {
    const weights = marking?.submission_type_weights || 
                   assignment?.submission_type_weights || {};
    const types = marking?.submission_types || 
                 assignment?.submission_types || {};
    
    return Object.keys(types).reduce((total, type) => {
      return types[type] ? total + (weights[type] || 0) : total;
    }, 0);
  };

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

      <h3 className="mt-6 mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
        Assignment Details
      </h3>
      {assignment.details && assignment.details.length > 0 ? (
        assignment.details.map((detail, index) => (
          <div
            key={index}
            className="p-4 mt-4 border border-gray-300 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
          >
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              {detail.topic}
            </h4>
            <p className="mt-1 text-gray-700 dark:text-gray-300">
              {detail.description}
            </p>
            {detail.subtopics && detail.subtopics.length > 0 && (
              <div className="mt-2 ml-4">
                {detail.subtopics.map((subtopic, subIndex) => (
                  <div
                    key={subIndex}
                    className="p-2 border-l-4 border-gray-400 dark:border-gray-500"
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

      <h3 className="mt-6 mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
        Deliverables
      </h3>
      {assignment.submission_types ? (
        <>
          <ul className="mb-2 text-gray-700 list-disc list-inside dark:text-gray-300">
            {Object.entries(assignment.submission_types)
              .filter(([type, isAccepted]) => isAccepted)
              .map(([type], index) => {
                const weight = marking?.submission_type_weights?.[type] || 
                             assignment?.submission_type_weights?.[type] || 
                             0;
                return (
                  <li key={index} className="capitalize">
                    {type} {weight > 0 && `(${weight}% of total grade)`}
                  </li>
                );
              })}
          </ul>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total weight: {calculateTotalWeight()}%
          </p>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No submission types specified.</p>
      )}

      <h3 className="mt-6 mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
        Marking Criteria
      </h3>
      
      {/* Display marking scheme from the marking prop if available */}
      {marking && marking.criteria ? (
        <>
          {marking.criteria.report && renderCriteriaTable(marking.criteria.report, "report")}
          {marking.criteria.code && renderCriteriaTable(marking.criteria.code, "code")}
          {marking.criteria.video && renderCriteriaTable(marking.criteria.video, "video")}
        </>
      ) : (
        // Fallback to assignment's marking_criteria if no marking scheme is available
        assignment.marking_criteria && (
          <>
            {assignment.marking_criteria.report && 
              renderSimpleCriteriaList(assignment.marking_criteria.report, "report")}
            {assignment.marking_criteria.code && 
              renderSimpleCriteriaList(assignment.marking_criteria.code, "code")}
            {assignment.marking_criteria.video && 
              renderSimpleCriteriaList(assignment.marking_criteria.video, "video")}
          </>
        )
      )}

      {/* Show message if no marking criteria available at all */}
      {(!marking || !marking.criteria) && 
       (!assignment.marking_criteria || 
        (Object.keys(assignment.marking_criteria).every(
          key => !assignment.marking_criteria[key] || assignment.marking_criteria[key].length === 0
        ))) && (
        <p className="text-gray-600 dark:text-gray-400">
          No marking criteria available.
        </p>
      )}
    </div>
  );
};

export default AssignmentDetails;