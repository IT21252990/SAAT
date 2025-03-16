import React from "react";

const AssignmentDetails = ({ assignment, moduleName }) => {
  return (
    <div>
      <h2>{assignment.name}</h2>
      <p>
        <strong>Module:</strong> {moduleName || "Unknown Module"}
      </p>
      <p>
        <strong>Assignment Description:</strong> {assignment.description}
      </p>
      <p>
        <strong>Deadline:</strong> {assignment.deadline}
      </p>

      <h3>Assignment Details</h3>
      {assignment.details && assignment.details.length > 0 ? (
        assignment.details.map((detail, index) => (
          <div key={index}>
            <h4>
              <strong>{detail.topic}</strong>
            </h4>
            <p>{detail.description}</p>
            {detail.subtopics && detail.subtopics.length > 0 && (
              <div style={{ marginLeft: "20px" }}>
                {detail.subtopics.map((subtopic, subIndex) => (
                  <div key={subIndex}>
                    <p>
                      <strong>{subtopic.topic}</strong>
                    </p>
                    <p>{subtopic.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No assignment details available.</p>
      )}

      <h3>Marking Criteria</h3>
      <ul>
        {assignment.marking_criteria &&
        Object.keys(assignment.marking_criteria).length > 0 ? (
          Object.entries(assignment.marking_criteria).map(
            ([type, criteria], index) => (
              <div key={index}>
                <h4>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Marking
                  Criteria:
                </h4>
                {criteria && criteria.length > 0 ? (
                  <ul>
                    {criteria.map((item, subIndex) => (
                      <li key={subIndex}>
                        <strong>{item.criteria}:</strong> {item.allocated_mark} marks
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No criteria available for this submission type.</p>
                )}
              </div>
            )
          )
        ) : (
          <p>No marking criteria available.</p>
        )}
      </ul>
    </div>
  );
};

export default AssignmentDetails;
