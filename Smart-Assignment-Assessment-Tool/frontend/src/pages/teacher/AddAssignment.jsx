import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { 
  Button, 
  TextInput, 
  Textarea, 
  Checkbox, 
  Label, 
  Card, 
  Alert, 
  Spinner, 
  Tooltip,
  Badge
} from "flowbite-react";
import { 
  HiPlusCircle, 
  HiMinusCircle, 
  HiOutlineDocumentText, 
  HiOutlineCalendar, 
  HiOutlineInformationCircle,
  HiArrowLeft, 
  HiDocumentAdd,
  HiSave,
  HiX
} from "react-icons/hi";

const AddAssignment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId, moduleName } = location.state || {};

  const [assignmentName, setAssignmentName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);

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
    if (!assignmentName || !deadline) {
      setError("Assignment name and deadline are required!");
      setIsSubmitting(false);
      return;
    }

    // Check if at least one submission type is selected
    if (!Object.values(submissionTypes).some(type => type === true)) {
      setError("Please select at least one submission type!");
      setIsSubmitting(false);
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
      console.log(data);
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
  
      console.log(markingSchemeData);
      try {
        const markingSchemeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/marking-scheme/create-marking-scheme`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(markingSchemeData),
        });
  
        console.log(markingSchemeResponse);

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
        // Success notification
        window.scrollTo(0, 0);
        alert("Assignment added successfully!");
        navigate(-1); // Navigate back to the Teacher Module Page
      } else {
        setError(data.error || "Something went wrong with creating the assignment!");
      }
    } catch (error) {
      setError("Failed to add assignment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Function to dismiss error
  const dismissError = () => {
    setError("");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>

      <div className="container px-4 py-8 pt-20 mx-auto">
        {/* Back button */}
        <Button 
          color="light" 
          onClick={() => navigate(-1)}
          className="mb-3 transition-all duration-300 group hover:bg-primary-100 dark:hover:bg-gray-700"
        >
          <HiArrowLeft className="mr-2 h-5 w-5 group-hover:translate-x-[-2px] transition-transform duration-300" />
          Back to Module
        </Button>

        <Card className="shadow-xl animate-slide-in-right dark:border-gray-700">
          {/* Card Header */}
          <div className="pb-4 mb-4 border-b dark:border-gray-700">
            <div className="flex items-center">
              <HiDocumentAdd className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Add Assignment: {moduleName || "Module"}
              </h2>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create a new assignment with detailed instructions and submission requirements.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <Alert color="failure" className="mb-4" onDismiss={dismissError}>
              <div className="flex items-center">
                <HiX className="w-5 h-5 mr-2" />
                <span>{error}</span>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="p-4 space-y-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                <HiOutlineInformationCircle className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                Basic Information
              </h3>
              
              {/* Assignment Name */}
              <div>
                <Label htmlFor="assignmentName" className="flex items-center mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assignment Name:
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <TextInput
                  id="assignmentName"
                  type="text"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  placeholder="Enter a descriptive name for this assignment"
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="flex items-center mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description:
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter a general overview of the assignment..."
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full"
                />
              </div>

              {/* Deadline */}
              <div>
                <Label htmlFor="deadline" className="flex items-center mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <HiOutlineCalendar className="w-5 h-5 mr-1 text-gray-600 dark:text-gray-400" />
                  Deadline:
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <TextInput
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="w-full sm:w-64"
                />
              </div>
            </div>

            {/* Assignment Details Section */}
            <div className="p-4 space-y-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                  <HiOutlineDocumentText className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                  Assignment Details
                </h3>
                <Tooltip content="Add main topics and subtopics to structure your assignment">
                  <Button color="light" size="xs">
                    <HiOutlineInformationCircle className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>

              {/* Main Topics and Subtopics */}
              {details.map((detail, index) => (
                <Card key={index} className="relative overflow-visible">
                  <div className="absolute flex items-center justify-center w-6 h-6 text-sm font-medium border rounded-full -left-2 top-4 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 border-primary-200 dark:border-primary-800">
                    {index+1}
                  </div>
                  
                  <div className="pl-6">
                    <Label htmlFor={`topic-${index}`} className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Main Topic:
                    </Label>
                    <div className="flex gap-2 mb-2">
                      <TextInput
                        id={`topic-${index}`}
                        type="text"
                        placeholder="Topic title"
                        value={detail.topic}
                        onChange={(e) => handleUpdateDetail(index, "topic", e.target.value)}
                        required
                        className="flex-grow"
                      />
                      <Tooltip content="Remove this topic">
                        <Button
                          color="light"
                          size="sm"
                          onClick={() => handleRemoveMainTopic(index)}
                          disabled={details.length === 1}
                          className="text-red-600 transition-colors hover:text-white hover:bg-red-600"
                        >
                          <HiMinusCircle className="w-5 h-5" />
                        </Button>
                      </Tooltip>
                    </div>
                    
                    <Textarea
                      placeholder="Detailed description of this topic"
                      value={detail.description}
                      onChange={(e) => handleUpdateDetail(index, "description", e.target.value)}
                      className="mb-4"
                      rows={3}
                    />

                    {/* Subtopics */}
                    {detail.subtopics.length > 0 && (
                      <div className="mb-4">
                        <Label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Subtopics:
                        </Label>
                        <div className="pl-4 space-y-4 border-l-2 border-gray-300 dark:border-gray-600">
                          {detail.subtopics.map((subtopic, subIndex) => (
                            <div key={subIndex} className="relative py-3 pl-4 pr-2 rounded-md bg-gray-50 dark:bg-gray-700">
                              <div className="absolute flex items-center justify-center w-5 h-5 text-xs font-medium text-gray-800 bg-gray-200 rounded-full -left-2 top-3 dark:bg-gray-600 dark:text-gray-200">
                                {subIndex+1}
                              </div>
                              
                              <div className="flex gap-2 mb-2">
                                <TextInput
                                  type="text"
                                  placeholder="Subtopic title"
                                  value={subtopic.topic}
                                  onChange={(e) => handleUpdateSubtopic(index, subIndex, "topic", e.target.value)}
                                  required
                                  className="flex-grow"
                                />
                                <Tooltip content="Remove this subtopic">
                                  <Button
                                    color="light"
                                    size="sm"
                                    onClick={() => handleRemoveSubtopic(index, subIndex)}
                                    className="text-red-600 transition-colors hover:text-white hover:bg-red-600"
                                  >
                                    <HiMinusCircle className="w-5 h-5" />
                                  </Button>
                                </Tooltip>
                              </div>
                              
                              <Textarea
                                placeholder="Detailed description of this subtopic"
                                value={subtopic.description}
                                onChange={(e) => handleUpdateSubtopic(index, subIndex, "description", e.target.value)}
                                rows={2}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Subtopic Button */}
                    <Button
                      color="light"
                      size="sm"
                      onClick={() => handleAddSubtopic(index)}
                      className="text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-700"
                    >
                      <HiPlusCircle className="w-4 h-4 mr-1" />
                      Add Subtopic
                    </Button>
                  </div>
                </Card>
              ))}

              {/* Add Main Topic Button */}
              <Button
                color="primary"
                onClick={handleAddMainTopic}
                className="w-full mt-4 group text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-700"
              >
                <HiPlusCircle className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                Add New Main Topic
              </Button>
            </div>

            {/* Submission Types Section */}
            <div className="p-4 space-y-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                <HiOutlineDocumentText className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                Submission Requirements
              </h3>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Select the types of submissions students need to provide for this assignment
              </p>

              <div className="grid gap-3 sm:grid-cols-3">
                {Object.keys(submissionTypes).map((type) => (
                  <div key={type} className={`
                    p-3 rounded-lg border-2 transition-all duration-200
                    ${submissionTypes[type] 
                      ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                  `}>
                    <Label className="flex items-center space-x-3 cursor-pointer">
                      <Checkbox
                        checked={submissionTypes[type]}
                        onChange={(e) =>
                          setSubmissionTypes({
                            ...submissionTypes,
                            [type]: e.target.checked,
                          })
                        }
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <span className="block font-medium text-gray-800 dark:text-gray-200">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {type === 'code' && 'Programming solutions'}
                          {type === 'report' && 'Written document/PDF'}
                          {type === 'video' && 'Video presentation'}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex flex-col justify-between gap-3 pt-6 border-t sm:flex-row dark:border-gray-700">
              <Button
                color="red"
                onClick={() => navigate(-1)}
                className="order-2 w-full sm:w-auto sm:order-1"
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                color="blue"
                className="order-1 w-full sm:w-auto sm:order-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiSave className="w-5 h-5 mr-2" />
                    Save Assignment
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* it21306754 - Report Modal */}
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