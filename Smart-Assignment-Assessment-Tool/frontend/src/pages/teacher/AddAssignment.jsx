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

  //it21306754
  const [showReportModal, setShowReportModal] = useState(false);
  const [rubric, setRubric] = useState({
    startDate: "",
    dueDate: "",
    rubricName: "",
    criteria: [],
  });
  const [newCriterion, setNewCriterion] = useState({
    name: "",
    lowDescription: "",
    highDescription: "",
    weight: "",
  });
  const handleCriterionChange = (e) => {
    setNewCriterion({ ...newCriterion, [e.target.name]: e.target.value });
  };
  const calculateTotalWeight = () => {
    return rubric.criteria.reduce((sum, criterion) => sum + Number(criterion.weight), 0);
  };
  const addCriterion = () => {
    if (!newCriterion.name || !newCriterion.lowDescription || !newCriterion.highDescription || !newCriterion.weight) {
      // toast.error("All fields are required.");
      return;
    }

    if (calculateTotalWeight() + Number(newCriterion.weight) > 100) {
      // toast.error("Total weight cannot exceed 100%.");
      return;
    }

    setRubric({
      ...rubric,
      criteria: [...rubric.criteria, newCriterion],
    });
    setNewCriterion({ name: "", lowDescription: "", highDescription: "", weight: "" });
    setError(""); // Clear errors after successful addition
  };

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
  console.log(data)
      // Assuming the response contains an `assignmentId`
      const assignmentId = data.assignment_id;  // Extract the assignmentId from the response
  
      // Prepare the marking scheme data including the assignmentId
      const markingSchemeData = {
        moduleCode: moduleId,
        rubricName: assignmentName,
        criteria: rubric.criteria.map((criterion) => ({
          name: criterion.name,
          lowDescription: criterion.lowDescription,
          highDescription: criterion.highDescription,
          weight: criterion.weight,
        })),
        assignment_id: assignmentId,  // Add assignmentId here
      };
  
      console.log(markingSchemeData)
      try {
        const markingSchemeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/marking-scheme/create-marking-scheme`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(markingSchemeData),
        });
  
        console.log(markingSchemeResponse)

        const markingSchemeDataResponse = await markingSchemeResponse.json();
  
        if (markingSchemeResponse.ok) {
          // toast.success("Rubric created successfully!");
          console.log("Success", markingSchemeDataResponse);
        } else {
          // toast.error(markingSchemeDataResponse.message || "Something went wrong!");
        }
      } catch (error) {
        // toast.error("Network error: " + error.message);
      }
  
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

          {/* it21306754  */}
          {Object.keys(submissionTypes).map((type) => (
            <Label key={type} className="flex items-center space-x-2">
              <Checkbox
                checked={submissionTypes[type]}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setSubmissionTypes({
                    ...submissionTypes,
                    [type]: isChecked, // Dynamically update the checkbox based on type
                  });

                  // Show the modal only if the 'report' checkbox is checked
                  if (type === 'report') {
                    setShowReportModal(isChecked);
                  }
                }}
              />
              <span>
                {type.charAt(0).toUpperCase() + type.slice(1)} Submission
              </span>
            </Label>
          ))}
          {/* it21306754 */}

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

      {/* it21306754  */}
      {showReportModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg w-[80%] max-h-[90vh] overflow-auto">
            <h1 className="text-xl font-bold text-blue-500">Marking Scheme</h1>

            <form onSubmit={handleSubmit}>
              {rubric.criteria.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-4 text-lg font-semibold text-blue-500">Marking Scheme</h2>
                  <div className="mb-2 p-2 bg-blue-100 rounded flex">
                    <span className="block text-gray-800 font-bold px-4 w-1/3">Criterion Name</span>
                    <p className="text-sm px-4 text-gray-800 font-bold w-1/2">Low Marks</p>
                    <p className="text-sm px-4 text-gray-800 font-bold w-1/2">High Marks</p>
                  </div>
                  {rubric.criteria.map((criterion, index) => (
                    <div key={index} className="mb-2 p-2 bg-blue-50 rounded flex">
                      <span className="block text-gray-800 font-semibold px-4 w-1/3">
                        {criterion.name} ({criterion.weight}%)
                      </span>
                      <p className="text-sm px-4 w-1/2">{criterion.lowDescription}</p>
                      <p className="text-sm px-4 w-1/2">{criterion.highDescription}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-4 flex flex-row items-start gap-x-6">
                <input
                  type="text"
                  name="name"
                  value={newCriterion.name}
                  onChange={handleCriterionChange}
                  placeholder="Criterion Name"
                  className="w-full p-2 border border-gray-300 rounded mb-2"
                />

                <textarea
                  rows="4"
                  name="lowDescription"
                  value={newCriterion.lowDescription}
                  onChange={handleCriterionChange}
                  placeholder="Requirements for Low Marks"
                  className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>

                <textarea
                  rows="4"
                  name="highDescription"
                  value={newCriterion.highDescription}
                  onChange={handleCriterionChange}
                  placeholder="Requirements for High Marks"
                  className="block w-full p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>

                <div className="flex flex-col w-full">
                  <input
                    type="number"
                    name="weight"
                    value={newCriterion.weight}
                    onChange={handleCriterionChange}
                    placeholder="Weight %"
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                  />
                  <button
                    type="button"
                    onClick={addCriterion}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Add Criterion
                  </button>
                </div>
              </div>

              {error && <p className="text-red-600 mb-2">{error}</p>}

              <button
                type="submit"
                className="w-1/2 mx-[25%] mt-12 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Create Rubric
              </button>
            </form>

            <Button
              color="red"
              size="xs"
              onClick={() => setShowReportModal(false)}
              className="absolute top-2 right-2"
            >
              Close
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddAssignment;
