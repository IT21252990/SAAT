import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const AddAssignment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId, moduleName } = location.state || {};

  const [assignmentName, setAssignmentName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [submissionTypes, setSubmissionTypes] = useState({
    code: false,
    report: false,
    video: false,
  });
  const [markingCriteria, setMarkingCriteria] = useState({
    code: [],
    report: [],
    video: [],
  });

  // Nested description state
  const [details, setDetails] = useState([
    { topic: "", description: "", subtopics: [] },
  ]);

  // Add a new marking criteria
  const handleAddCriteria = (type) => {
    setMarkingCriteria((prev) => ({
      ...prev,
      [type]: [...prev[type], { criteria: "", allocated_mark: "" }],
    }));
  };

  // Update marking criteria
  const handleChangeCriteria = (type, index, field, value) => {
    setMarkingCriteria((prev) => {
      const updated = [...prev[type]];
      updated[index][field] = value;
      return { ...prev, [type]: updated };
    });
  };

  // Add new main topic
  const handleAddMainTopic = () => {
    setDetails([...details, { topic: "", description: "", subtopics: [] }]);
  };

  // Update a topic or description
  const handleUpdateDetail = (index, field, value) => {
    const updatedDetails = [...details];
    updatedDetails[index][field] = value;
    setDetails(updatedDetails);
  };

  // Add a subtopic dynamically
  const handleAddSubtopic = (index) => {
    const updatedDetails = [...details];
    updatedDetails[index].subtopics.push({
      topic: "",
      description: "",
      subtopics: [],
    });
    setDetails(updatedDetails);
  };

  // Update subtopic at any level
  const handleUpdateSubtopic = (parentIndex, subIndex, field, value) => {
    const updatedDetails = [...details];
    updatedDetails[parentIndex].subtopics[subIndex][field] = value;
    setDetails(updatedDetails);
  };

  // Submit assignment
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Log the payload to ensure it's structured correctly
    const payload = {
      module_id: moduleId,
      name: assignmentName,
      description: assignmentDescription,
      deadline,
      submission_types: submissionTypes,
      markingCriteria: markingCriteria,
      details,
    };
  
    console.log("Sending Payload:", payload);
  
    // Check if required fields are filled
    if (
      !assignmentName ||
      !deadline ||
      Object.values(markingCriteria).some((criteriaArray) =>
        criteriaArray.some((criteria) => !criteria.criteria || !criteria.allocated_mark)
      )
    ) {
      setError("All fields are required!");
      return;
    }
  
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/assignment/createAssignment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
  
      const data = await response.json();
  
      if (response.ok) {
        alert("Assignment added successfully!");
        navigate(-1); // Navigate back to the Teacher Module Page
      } else {
        setError(data.error || "Something went wrong!");
      }
    } catch (error) {
      setError("Failed to add assignment: " + error.message);
    }
  };
  
  
  

  return (
    <div className="container">
      <h2>Add Assignment for {moduleName || "Module"}</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Assignment Name */}
        <label>Assignment Name:</label>
        <input
          type="text"
          value={assignmentName}
          onChange={(e) => setAssignmentName(e.target.value)}
          required
        />
        {/* Description */}
        <h3>Description About the Assignment:</h3>
        <textarea
          placeholder="Enter assignment details..."
          value={assignmentDescription}
          onChange={(e) => setAssignmentDescription(e.target.value)}
          required
        />

        {/* Deadline */}
        <label>Deadline:</label>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />

        {/* Marking Criteria
        <h3>Marking Criteria:</h3>
        {markingCriteria.map((criteria, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <input
              type="text"
              placeholder="Criteria"
              value={criteria.criteria}
              onChange={(e) =>
                handleChangeCriteria(index, "criteria", e.target.value)
              }
              required
            />
            <input
              type="number"
              placeholder="Allocated Mark"
              value={criteria.allocated_mark}
              onChange={(e) =>
                handleChangeCriteria(index, "allocated_mark", e.target.value)
              }
              required
            />
          </div>
        ))}
        <button type="button" onClick={handleAddCriteria}>
          + Add More Criteria
        </button> */}

        {/* Assignment Details */}
        <h3>Assignment Details:</h3>
        {details.map((detail, index) => (
          <div
            key={index}
            style={{
              marginBottom: "10px",
              paddingLeft: "10px",
              borderLeft: "2px solid #ddd",
            }}
          >
            <input
              type="text"
              placeholder="Main Topic"
              value={detail.topic}
              onChange={(e) =>
                handleUpdateDetail(index, "topic", e.target.value)
              }
              required
            />
            <textarea
              placeholder="Description"
              value={detail.description}
              onChange={(e) =>
                handleUpdateDetail(index, "description", e.target.value)
              }
              required
            />

            {/* Subtopics */}
            {detail.subtopics.map((subtopic, subIndex) => (
              <div
                key={subIndex}
                style={{
                  marginLeft: "20px",
                  borderLeft: "2px dashed #aaa",
                  paddingLeft: "10px",
                }}
              >
                <input
                  type="text"
                  placeholder="Subtopic"
                  value={subtopic.topic}
                  onChange={(e) =>
                    handleUpdateSubtopic(
                      index,
                      subIndex,
                      "topic",
                      e.target.value
                    )
                  }
                  required
                />
                <textarea
                  placeholder="Description"
                  value={subtopic.description}
                  onChange={(e) =>
                    handleUpdateSubtopic(
                      index,
                      subIndex,
                      "description",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            ))}
            <button type="button" onClick={() => handleAddSubtopic(index)}>
              + Add Subtopic
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddMainTopic}>
          + Add Main Topic
        </button>

        {/* Submission Types */}
        <h3>Submission Types:</h3>
        {Object.keys(submissionTypes).map((type) => (
          <label key={type} style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={submissionTypes[type]}
              onChange={(e) =>
                setSubmissionTypes({
                  ...submissionTypes,
                  [type]: e.target.checked,
                })
              }
            />
            {type.charAt(0).toUpperCase() + type.slice(1)} Submission
          </label>
        ))}

        {Object.keys(submissionTypes).map((type) =>
          submissionTypes[type] ? (
            <div key={type}>
              <h4>
                {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria:
              </h4>
              {markingCriteria[type].map((criteria, index) => (
                <div key={index}>
                  <input
                    type="text"
                    placeholder="Criteria"
                    value={criteria.criteria}
                    onChange={(e) =>
                      handleChangeCriteria(
                        type,
                        index,
                        "criteria",
                        e.target.value
                      )
                    }
                    required
                  />
                  <input
                    type="number"
                    placeholder="Allocated Mark"
                    value={criteria.allocated_mark}
                    onChange={(e) =>
                      handleChangeCriteria(
                        type,
                        index,
                        "allocated_mark",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              ))}
              <button type="button" onClick={() => handleAddCriteria(type)}>
                + Add {type.charAt(0).toUpperCase() + type.slice(1)} Criteria
              </button>
            </div>
          ) : null
        )}

        {/* Submit Button */}
        <button type="submit">Save Assignment</button>
      </form>

      <button onClick={() => navigate(-1)} style={{ marginTop: "10px" }}>
        Cancel
      </button>
    </div>
  );
};

export default AddAssignment;
