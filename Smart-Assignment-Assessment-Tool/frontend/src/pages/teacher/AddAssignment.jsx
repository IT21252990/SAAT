import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Button, TextInput, Textarea, Checkbox, Label } from "flowbite-react";

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

  const handleRemoveMainTopic = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleRemoveSubtopic = (mainIndex, subIndex) => {
    const updatedDetails = [...details];
    updatedDetails[mainIndex].subtopics = updatedDetails[
      mainIndex
    ].subtopics.filter((_, i) => i !== subIndex);
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
        criteriaArray.some(
          (criteria) => !criteria.criteria || !criteria.allocated_mark,
        ),
      )
    ) {
      setError("All fields are required!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assignment/createAssignment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
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
    <div className="flex h-full min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mb-10 mt-10 w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Add Assignment for {moduleName || "Module"}
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assignment Name */}
          <div>
            <Label>Assignment Name:</Label>
            <TextInput
              type="text"
              value={assignmentName}
              onChange={(e) => setAssignmentName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description About the Assignment:</Label>
            <Textarea
              placeholder="Enter assignment details..."
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
              required
            />
          </div>

          {/* Deadline */}
          <div>
            <Label>Deadline:</Label>
            <TextInput
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          {/* Assignment Details */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Assignment Details:
          </h3>
          {details.map((detail, index) => (
            <div
              key={index}
              className="relative space-y-2 border-l-4 border-gray-300 p-4 dark:border-gray-600"
            >
              <div className="relative">
                <Label>Main Topic:</Label>
                <TextInput
                  type="text"
                  placeholder="Main Topic"
                  value={detail.topic}
                  onChange={(e) =>
                    handleUpdateDetail(index, "topic", e.target.value)
                  }
                  required
                  className="mb-2 max-w-3xl"
                />
                <Textarea
                  placeholder="Description"
                  value={detail.description}
                  onChange={(e) =>
                    handleUpdateDetail(index, "description", e.target.value)
                  }
                  required
                  className="max-w-3xl"
                />
                {/* Remove Main Topic Button */}
                <Button
                  color="red"
                  size="xs"
                  className="absolute right-2 top-1/2 -translate-y-1/2 transform"
                  onClick={() => handleRemoveMainTopic(index)}
                >
                  Remove
                </Button>
              </div>

              {/* Subtopics */}
              {detail.subtopics.map((subtopic, subIndex) => (
                <div
                  key={subIndex}
                  className="relative ml-4 space-y-2 border-l-2 border-gray-400 pl-4"
                >
                  <div className="relative">
                    <Label>Subtopic:</Label>
                    <TextInput
                      type="text"
                      placeholder="Subtopic"
                      value={subtopic.topic}
                      onChange={(e) =>
                        handleUpdateSubtopic(
                          index,
                          subIndex,
                          "topic",
                          e.target.value,
                        )
                      }
                      required
                      className="max-w-3xl"
                    />
                    <Textarea
                      placeholder="Description"
                      value={subtopic.description}
                      className="max-w-3xl"
                      onChange={(e) =>
                        handleUpdateSubtopic(
                          index,
                          subIndex,
                          "description",
                          e.target.value,
                        )
                      }
                      required
                    />
                    {/* Remove Subtopic Button */}
                    <Button
                      color="red"
                      size="xs"
                      className="absolute right-2 top-1/2 -translate-y-1/2 transform"
                      onClick={() => handleRemoveSubtopic(index, subIndex)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              {/* Add Subtopic Button */}
              <Button color="blue" onClick={() => handleAddSubtopic(index)}>
                + Add Subtopic
              </Button>
            </div>
          ))}
          {/* Add Main Topic Button */}
          <Button color="blue" onClick={handleAddMainTopic}>
            + Add Main Topic
          </Button>
          {/* Submission Types */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Submission Types:
          </h3>
          {Object.keys(submissionTypes).map((type) => (
            <Label key={type} className="flex items-center space-x-2">
              <Checkbox
                checked={submissionTypes[type]}
                onChange={(e) =>
                  setSubmissionTypes({
                    ...submissionTypes,
                    [type]: e.target.checked,
                  })
                }
              />
              <span>
                {type.charAt(0).toUpperCase() + type.slice(1)} Submission
              </span>
            </Label>
          ))}

          {/* Submission Type Marking Criteria
          {Object.keys(submissionTypes).map((type) =>
            submissionTypes[type] ? (
              <div key={type} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                <h4 className="text-md font-semibold">
                  {type.charAt(0).toUpperCase() + type.slice(1)} Marking Criteria:
                </h4>
                {markingCriteria[type].map((criteria, index) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <TextInput
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
                    <TextInput
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

              <Button color="green" onClick={() => handleAddCriteria(type)}>
                + Add {type.charAt(0).toUpperCase() + type.slice(1)} Criteria
              </Button>
              </div>
            ) : null
          )} */}

          {/* Submit & Cancel Buttons */}
          <div className="mt-4 flex space-x-4">
            <Button type="submit" color="blue">
              Save Assignment
            </Button>
            <Button color="red" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssignment;
