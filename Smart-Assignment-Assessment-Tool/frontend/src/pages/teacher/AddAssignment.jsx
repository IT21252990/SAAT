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
    mediumDescription: "",
    highDescription: "",
    weight: "",
  });

  // Code marking criteria states
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeRubric, setCodeRubric] = useState({
    startDate: "",
    dueDate: "",
    rubricName: "",
    criteria: [],
  });
  const [newCodeCriterion, setNewCodeCriterion] = useState({
    name: "",
    lowDescription: "",
    mediumDescription: "",
    highDescription: "",
    weight: "",
  });

  // Video marking criteria states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoRubric, setVideoRubric] = useState({
    startDate: "",
    dueDate: "",
    rubricName: "",
    criteria: [],
  });
  const [newVideoCriterion, setNewVideoCriterion] = useState({
    name: "",
    lowDescription: "",
    mediumDescription: "",
    highDescription: "",
    weight: "",
  });

  //------------------------
  const [submissionTypeWeights, setSubmissionTypeWeights] = useState({
    code: 0,
    report: 0,
    video: 0,
  });

  const calculateSubmissionTypeWeightTotal = () => {
    return Object.keys(submissionTypes).reduce((total, type) => {
      return submissionTypes[type] ? total + (submissionTypeWeights[type] || 0) : total;
    }, 0);
  };

  const handleSubmissionTypeChange = (type, checked) => {
  setSubmissionTypes({
    ...submissionTypes,
    [type]: checked,
  });

  // Reset weight when unchecked
  if (!checked) {
    setSubmissionTypeWeights(prev => ({
      ...prev,
      [type]: 0
    }));
  }

  // Open respective modal when checkbox is checked
  if (checked) {
    if (type === 'report') {
      setShowReportModal(true);
    } else if (type === 'code') {
      setShowCodeModal(true);
    } else if (type === 'video') {
      setShowVideoModal(true);
    }
  }
};

  const handleCriterionChange = (e) => {
    setNewCriterion({ ...newCriterion, [e.target.name]: e.target.value });
  };

  const calculateTotalWeight = () => {
    return rubric.criteria.reduce((sum, criterion) => sum + Number(criterion.weight), 0);
  };

  const addCriterion = () => {
    if (!newCriterion.name || !newCriterion.lowDescription || !newCriterion.mediumDescription || !newCriterion.highDescription || !newCriterion.weight) {
      setError("All fields are required.");
      return;
    }

    const weightNum = Number(newCriterion.weight);
    if (weightNum <= 0 || weightNum > 100) {
      setError("Weight must be between 1 and 100.");
      return;
    }

    if (calculateTotalWeight() + weightNum > 100) {
      setError("Total weight cannot exceed 100%.");
      return;
    }

    setRubric({
      ...rubric,
      criteria: [...rubric.criteria, { ...newCriterion, weight: weightNum }],
    });
    setNewCriterion({ name: "", lowDescription: "", mediumDescription: "", highDescription: "", weight: "" });
    setError(""); // Clear errors after successful addition
  };

  const removeCriterion = (index) => {
    setRubric({
      ...rubric,
      criteria: rubric.criteria.filter((_, i) => i !== index),
    });
  };

  const saveRubric = () => {
    const totalWeight = calculateTotalWeight();
    
    if (rubric.criteria.length === 0) {
      setError("Please add at least one criterion before saving.");
      return;
    }

    if (totalWeight !== 100) {
      setError(`Total weight must equal 100%. Current total: ${totalWeight}%`);
      return;
    }

    // Close modal and keep rubric data temporarily
    setShowReportModal(false);
    setError("");
    
    // Show success message
    alert("Rubric saved successfully! You can now save the assignment.");
  };

  const closeModalAndUncheckReport = () => {
    setShowReportModal(false);
    setSubmissionTypes({
      ...submissionTypes,
      report: false,
    });
    // Clear rubric data if modal is closed without saving
    setRubric({
      startDate: "",
      dueDate: "",
      rubricName: "",
      criteria: [],
    });
    setError("");
  };

  // Code rubric handlers
  const handleCodeCriterionChange = (e) => {
    setNewCodeCriterion({ ...newCodeCriterion, [e.target.name]: e.target.value });
  };

  const calculateCodeTotalWeight = () => {
    return codeRubric.criteria.reduce((sum, criterion) => sum + Number(criterion.weight), 0);
  };

  const addCodeCriterion = () => {
    if (!newCodeCriterion.name || !newCodeCriterion.lowDescription || !newCodeCriterion.mediumDescription || !newCodeCriterion.highDescription || !newCodeCriterion.weight) {
      setError("All fields are required.");
      return;
    }

    const weightNum = Number(newCodeCriterion.weight);
    if (weightNum <= 0 || weightNum > 100) {
      setError("Weight must be between 1 and 100.");
      return;
    }

    if (calculateCodeTotalWeight() + weightNum > 100) {
      setError("Total weight cannot exceed 100%.");
      return;
    }

    setCodeRubric({
      ...codeRubric,
      criteria: [...codeRubric.criteria, { ...newCodeCriterion, weight: weightNum }],
    });
    setNewCodeCriterion({ name: "", lowDescription: "", mediumDescription: "", highDescription: "", weight: "" });
    setError(""); // Clear errors after successful addition
  };

  const removeCodeCriterion = (index) => {
    setCodeRubric({
      ...codeRubric,
      criteria: codeRubric.criteria.filter((_, i) => i !== index),
    });
  };

  const saveCodeRubric = () => {
    const totalWeight = calculateCodeTotalWeight();
    
    if (codeRubric.criteria.length === 0) {
      setError("Please add at least one criterion before saving.");
      return;
    }

    if (totalWeight !== 100) {
      setError(`Total weight must equal 100%. Current total: ${totalWeight}%`);
      return;
    }

    // Close modal and keep rubric data temporarily
    setShowCodeModal(false);
    setError("");
    
    // Show success message
    alert("Code rubric saved successfully! You can now save the assignment.");
  };

  const closeCodeModalAndUncheck = () => {
    setShowCodeModal(false);
    setSubmissionTypes({
      ...submissionTypes,
      code: false,
    });
    // Clear rubric data if modal is closed without saving
    setCodeRubric({
      startDate: "",
      dueDate: "",
      rubricName: "",
      criteria: [],
    });
    setError("");
  };

  // Video rubric handlers
  const handleVideoCriterionChange = (e) => {
    setNewVideoCriterion({ ...newVideoCriterion, [e.target.name]: e.target.value });
  };

  const calculateVideoTotalWeight = () => {
    return videoRubric.criteria.reduce((sum, criterion) => sum + Number(criterion.weight), 0);
  };

  const addVideoCriterion = () => {
    if (!newVideoCriterion.name || !newVideoCriterion.lowDescription || !newVideoCriterion.mediumDescription || !newVideoCriterion.highDescription || !newVideoCriterion.weight) {
      setError("All fields are required.");
      return;
    }

    const weightNum = Number(newVideoCriterion.weight);
    if (weightNum <= 0 || weightNum > 100) {
      setError("Weight must be between 1 and 100.");
      return;
    }

    if (calculateVideoTotalWeight() + weightNum > 100) {
      setError("Total weight cannot exceed 100%.");
      return;
    }

    setVideoRubric({
      ...videoRubric,
      criteria: [...videoRubric.criteria, { ...newVideoCriterion, weight: weightNum }],
    });
    setNewVideoCriterion({ name: "", lowDescription: "", mediumDescription: "", highDescription: "", weight: "" });
    setError(""); // Clear errors after successful addition
  };

  const removeVideoCriterion = (index) => {
    setVideoRubric({
      ...videoRubric,
      criteria: videoRubric.criteria.filter((_, i) => i !== index),
    });
  };

  const saveVideoRubric = () => {
    const totalWeight = calculateVideoTotalWeight();
    
    if (videoRubric.criteria.length === 0) {
      setError("Please add at least one criterion before saving.");
      return;
    }

    if (totalWeight !== 100) {
      setError(`Total weight must equal 100%. Current total: ${totalWeight}%`);
      return;
    }

    // Close modal and keep rubric data temporarily
    setShowVideoModal(false);
    setError("");
    
    // Show success message
    alert("Video rubric saved successfully! You can now save the assignment.");
  };

  const closeVideoModalAndUncheck = () => {
    setShowVideoModal(false);
    setSubmissionTypes({
      ...submissionTypes,
      video: false,
    });
    // Clear rubric data if modal is closed without saving
    setVideoRubric({
      startDate: "",
      dueDate: "",
      rubricName: "",
      criteria: [],
    });
    setError("");
  };

  // Add new marking criteria
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

    if (submissionTypes.report) {
      if (rubric.criteria.length === 0) {
        setError("Please create a rubric for the report submission type!");
        setIsSubmitting(false);
        return;
      }
      
      const reportTotalWeight = calculateTotalWeight();
      if (reportTotalWeight !== 100) {
        setError(`Report rubric total weight must equal 100%. Current total: ${reportTotalWeight}%`);
        setIsSubmitting(false);
        return;
      }
    }

    if (submissionTypes.code) {
      if (codeRubric.criteria.length === 0) {
        setError("Please create a rubric for the code submission type!");
        setIsSubmitting(false);
        return;
      }
      
      const codeTotalWeight = calculateCodeTotalWeight();
      if (codeTotalWeight !== 100) {
        setError(`Code rubric total weight must equal 100%. Current total: ${codeTotalWeight}%`);
        setIsSubmitting(false);
        return;
      }
    }

    if (submissionTypes.video) {
      if (videoRubric.criteria.length === 0) {
        setError("Please create a rubric for the video submission type!");
        setIsSubmitting(false);
        return;
      }
      
      const videoTotalWeight = calculateVideoTotalWeight();
      if (videoTotalWeight !== 100) {
        setError(`Video rubric total weight must equal 100%. Current total: ${videoTotalWeight}%`);
        setIsSubmitting(false);
        return;
      }
    }

    // Check if submission type weights total 100%
    if (calculateSubmissionTypeWeightTotal() !== 100) {
      setError("Submission type weights must total 100%!");
      setIsSubmitting(false);
      return;
    }

    // Log the payload to ensure it's structured correctly
    const payload = {
      module_id: moduleId,
      name: assignmentName,
      description: assignmentDescription,
      deadline,
      submission_types: submissionTypes,
      submission_type_weights: submissionTypeWeights,
      markingCriteria: markingCriteria,
      details,
    };
  
    console.log("Sending Payload:", payload);
  
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
      
      if (!response.ok) {
        setError(data.error || "Something went wrong with creating the assignment!");
        setIsSubmitting(false);
        return;
      }

      const assignmentId = data.assignment_id;  // Extract the assignmentId from the response

      // Prepare criteria for all selected submission types
      const allCriteria = {};

      if (submissionTypes.report && rubric.criteria.length > 0) {
        allCriteria.report = rubric.criteria.map((criterion) => ({
          name: criterion.name,
          lowDescription: criterion.lowDescription,
          mediumDescription: criterion.mediumDescription,
          highDescription: criterion.highDescription,
          weight: criterion.weight,
        }));
      }

      if (submissionTypes.code && codeRubric.criteria.length > 0) {
        allCriteria.code = codeRubric.criteria.map((criterion) => ({
          name: criterion.name,
          lowDescription: criterion.lowDescription,
          mediumDescription: criterion.mediumDescription,
          highDescription: criterion.highDescription,
          weight: criterion.weight,
        }));
      }

      if (submissionTypes.video && videoRubric.criteria.length > 0) {
        allCriteria.video = videoRubric.criteria.map((criterion) => ({
          name: criterion.name,
          lowDescription: criterion.lowDescription,
          mediumDescription: criterion.mediumDescription,
          highDescription: criterion.highDescription,
          weight: criterion.weight,
        }));
      }

      // Create marking scheme if any rubrics exist
      if (Object.keys(allCriteria).length > 0) {
        const markingSchemeData = {
          moduleCode: moduleId,
          rubricName: assignmentName,
          criteria: allCriteria,  // This will be the dict with different submission types
          assignment_id: assignmentId,
          submissionTypes: submissionTypes,
          submissionTypeWeights: submissionTypeWeights 
        };
        
        try {
          const markingSchemeResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/marking-scheme/create-marking-scheme`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(markingSchemeData),
          });

          console.log(markingSchemeData);
          console.log(markingSchemeResponse);

          const markingSchemeDataResponse = await markingSchemeResponse.json();

          if (markingSchemeResponse.ok) {
            console.log("Marking schemes created successfully!", markingSchemeDataResponse);
          } else {
            console.error("Failed to create marking schemes:", markingSchemeDataResponse.message || "Something went wrong!");
            // Don't fail the entire process if rubric creation fails
          }
        } catch (error) {
          console.error("Network error creating marking schemes:", error.message);
          // Don't fail the entire process if rubric creation fails
        }
      }

      // Success notification
      window.scrollTo(0, 0);
      alert("Assignment added successfully!");
      navigate(-1); // Navigate back to the Teacher Module Page
      
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

              {/* <div className="grid gap-3 sm:grid-cols-3">
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
                        onChange={(e) => handleSubmissionTypeChange(type, e.target.checked)}
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
              </div> */}
              <div className="grid gap-3 sm:grid-cols-3">
                {Object.keys(submissionTypes).map((type) => (
                  <div key={type} className={`
                    p-3 rounded-lg border-2 transition-all duration-200
                    ${submissionTypes[type] 
                      ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/30' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                  `}>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={submissionTypes[type]}
                        onChange={(e) => handleSubmissionTypeChange(type, e.target.checked)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-grow">
                        <span className="block font-medium text-gray-800 dark:text-gray-200">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {type === 'code' && 'Programming solutions'}
                          {type === 'report' && 'Written document/PDF'}
                          {type === 'video' && 'Video presentation'}
                        </span>
                      </div>
                    </div>
                    
                    {submissionTypes[type] && (
                      <div className="mt-3">
                        <Label htmlFor={`${type}-weight`} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Weight (% of total grade)
                        </Label>
                        <TextInput
                          id={`${type}-weight`}
                          type="number"
                          min="1"
                          max="100"
                          value={submissionTypeWeights[type]}
                          onChange={(e) => {
                            const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                            setSubmissionTypeWeights(prev => ({
                              ...prev,
                              [type]: value
                            }));
                          }}
                          required
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add validation message */}
              {Object.values(submissionTypes).some(t => t) && (
                <div className={`mt-2 text-sm ${
                  calculateSubmissionTypeWeightTotal() === 100 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  Total submission type weight: {calculateSubmissionTypeWeightTotal()}%
                  {calculateSubmissionTypeWeightTotal() !== 100 && " (Must equal 100%)"}
                </div>
              )}

              {/* Rubric Status Display for all submission types */}
              {submissionTypes.report && (
                <div className="p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/30 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-800 dark:text-blue-200">Report Rubric</h4>
                      {rubric.criteria.length > 0 ? (
                        <p className="text-sm text-blue-600 dark:text-blue-300">
                          {rubric.criteria.length} criteria added (Total: {calculateTotalWeight()}%)
                        </p>
                      ) : (
                        <p className="text-sm text-blue-600 dark:text-blue-300">No rubric created yet</p>
                      )}
                    </div>
                    <Button
                      color="blue"
                      size="sm"
                      onClick={() => setShowReportModal(true)}
                    >
                      {rubric.criteria.length > 0 ? 'Edit Rubric' : 'Create Rubric'}
                    </Button>
                  </div>
                </div>
              )}

              {submissionTypes.code && (
                <div className="p-3 mt-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/30 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">Code Rubric</h4>
                      {codeRubric.criteria.length > 0 ? (
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {codeRubric.criteria.length} criteria added (Total: {calculateCodeTotalWeight()}%)
                        </p>
                      ) : (
                        <p className="text-sm text-green-600 dark:text-green-300">No rubric created yet</p>
                      )}
                    </div>
                    <Button
                      color="green"
                      size="sm"
                      onClick={() => setShowCodeModal(true)}
                    >
                      {codeRubric.criteria.length > 0 ? 'Edit Rubric' : 'Create Rubric'}
                    </Button>
                  </div>
                </div>
              )}

              {submissionTypes.video && (
                <div className="p-3 mt-4 border border-purple-200 rounded-lg bg-purple-50 dark:bg-purple-900/30 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-purple-800 dark:text-purple-200">Video Rubric</h4>
                      {videoRubric.criteria.length > 0 ? (
                        <p className="text-sm text-purple-600 dark:text-purple-300">
                          {videoRubric.criteria.length} criteria added (Total: {calculateVideoTotalWeight()}%)
                        </p>
                      ) : (
                        <p className="text-sm text-purple-600 dark:text-purple-300">No rubric created yet</p>
                      )}
                    </div>
                    <Button
                      color="purple"
                      size="sm"
                      onClick={() => setShowVideoModal(true)}
                    >
                      {videoRubric.criteria.length > 0 ? 'Edit Rubric' : 'Create Rubric'}
                    </Button>
                  </div>
                </div>
              )}
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

      {/* Report Modal - Enhanced */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Create Marking Scheme</h1>
              <Button
                color="light"
                size="sm"
                onClick={closeModalAndUncheckReport}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-5 h-5" />
              </Button>
            </div>

            {/* Current Criteria Display */}
            {rubric.criteria.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Current Criteria ({rubric.criteria.length})
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    calculateTotalWeight() === 100 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    Total Weight: {calculateTotalWeight()}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-gray-800 bg-blue-100 rounded dark:bg-blue-900/30 dark:text-gray-200">
                    <div className="col-span-3">Criterion Name</div>
                    <div className="col-span-3">Low Marks Description</div>
                    <div className="col-span-3">Medium Marks Description</div>
                    <div className="col-span-3">High Marks Description</div>
                    <div className="col-span-2">Weight (%)</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  
                  {rubric.criteria.map((criterion, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 rounded bg-gray-50 dark:bg-gray-700">
                      <div className="col-span-3 font-medium text-gray-800 dark:text-gray-200">
                        {criterion.name}
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.lowDescription}
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.mediumDescription}
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.highDescription}
                      </div>
                      <div className="col-span-2 font-medium text-gray-800 dark:text-gray-200">
                        {criterion.weight}%
                      </div>
                      <div className="col-span-1">
                        <Button
                          color="red"
                          size="xs"
                          onClick={() => removeCriterion(index)}
                        >
                          <HiMinusCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Criterion Form */}
            <div className="p-4 mb-6 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Add New Criterion</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Criterion Name *
                  </Label>
                  <TextInput
                    type="text"
                    name="name"
                    value={newCriterion.name}
                    onChange={handleCriterionChange}
                    placeholder="e.g., Code Quality, Documentation"
                    required
                  />
                </div>
                
                <div>
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weight (%) *
                  </Label>
                  <TextInput
                    type="number"
                    name="weight"
                    value={newCriterion.weight}
                    onChange={handleCriterionChange}
                    placeholder="e.g., 25"
                    min="1"
                    max="100"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Remaining: {100 - calculateTotalWeight()}%
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Low Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="lowDescription"
                    value={newCriterion.lowDescription}
                    onChange={handleCriterionChange}
                    placeholder="Requirements for achieving low marks in this criterion..."
                    required
                  />
                </div>

                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Medium Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="mediumDescription"
                    value={newCriterion.mediumDescription}
                    onChange={handleCriterionChange}
                    placeholder="Requirements for achieving medium marks in this criterion..."
                    required
                  />
                </div>

                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    High Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="highDescription"
                    value={newCriterion.highDescription}
                    onChange={handleCriterionChange}
                    placeholder="Requirements for achieving high marks in this criterion..."
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addCriterion}
                color="blue"
                className="w-full"
                disabled={calculateTotalWeight() >= 100}
              >
                <HiPlusCircle className="w-5 h-5 mr-2" />
                Add Criterion
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert color="failure" className="mb-4">
                <HiX className="w-5 h-5 mr-2" />
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <Button
                color="light"
                onClick={closeModalAndUncheckReport}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                color="blue"
                onClick={saveRubric}
                className="w-full sm:w-auto"
                disabled={rubric.criteria.length === 0 || calculateTotalWeight() !== 100}
              >
                <HiSave className="w-5 h-5 mr-2" />
                Save Rubric ({calculateTotalWeight()}%)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-green-600 dark:text-green-400">Create Code Marking Scheme</h1>
              <Button
                color="light"
                size="sm"
                onClick={closeCodeModalAndUncheck}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-5 h-5" />
              </Button>
            </div>

            {/* Current Code Criteria Display */}
            {codeRubric.criteria.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Current Code Criteria ({codeRubric.criteria.length})
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    calculateCodeTotalWeight() === 100 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    Total Weight: {calculateCodeTotalWeight()}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-gray-800 bg-green-100 rounded dark:bg-green-900/30 dark:text-gray-200">
                    <div className="col-span-3">Criterion Name</div>
                    <div className="col-span-3">Low Marks Description</div>
                    <div className="col-span-3">Medium Marks Description</div>
                    <div className="col-span-2">High Marks Description</div>
                    <div className="col-span-1">Weight (%)</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  
                  {codeRubric.criteria.map((criterion, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 rounded bg-gray-50 dark:bg-gray-700">
                      <div className="col-span-3 font-medium text-gray-800 dark:text-gray-200">
                        {criterion.name}
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.lowDescription}
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.mediumDescription}
                      </div>
                      <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.highDescription}
                      </div>
                      <div className="col-span-1 font-medium text-gray-800 dark:text-gray-200">
                        {criterion.weight}%
                      </div>
                      <div className="col-span-1">
                        <Button
                          color="red"
                          size="xs"
                          onClick={() => removeCodeCriterion(index)}
                        >
                          <HiMinusCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Code Criterion Form */}
            <div className="p-4 mb-6 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Add New Code Criterion</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Criterion Name *
                  </Label>
                  <TextInput
                    type="text"
                    name="name"
                    value={newCodeCriterion.name}
                    onChange={handleCodeCriterionChange}
                    placeholder="e.g., Algorithm Efficiency, Code Structure"
                    required
                  />
                </div>
                
                <div>
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weight (%) *
                  </Label>
                  <TextInput
                    type="number"
                    name="weight"
                    value={newCodeCriterion.weight}
                    onChange={handleCodeCriterionChange}
                    placeholder="e.g., 25"
                    min="1"
                    max="100"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Remaining: {100 - calculateCodeTotalWeight()}%
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Low Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="lowDescription"
                    value={newCodeCriterion.lowDescription}
                    onChange={handleCodeCriterionChange}
                    placeholder="Requirements for achieving low marks in this criterion..."
                    required
                  />
                </div>

                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Medium Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="mediumDescription"
                    value={newCodeCriterion.mediumDescription}
                    onChange={handleCodeCriterionChange}
                    placeholder="Requirements for achieving medium marks in this criterion..."
                    required
                  />
                </div>

                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    High Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="highDescription"
                    value={newCodeCriterion.highDescription}
                    onChange={handleCodeCriterionChange}
                    placeholder="Requirements for achieving high marks in this criterion..."
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addCodeCriterion}
                color="green"
                className="w-full"
                disabled={calculateCodeTotalWeight() >= 100}
              >
                <HiPlusCircle className="w-5 h-5 mr-2" />
                Add Code Criterion
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert color="failure" className="mb-4">
                <HiX className="w-5 h-5 mr-2" />
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <Button
                color="light"
                onClick={closeCodeModalAndUncheck}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                color="green"
                onClick={saveCodeRubric}
                className="w-full sm:w-auto"
                disabled={codeRubric.criteria.length === 0 || calculateCodeTotalWeight() !== 100}
              >
                <HiSave className="w-5 h-5 mr-2" />
                Save Code Rubric ({calculateCodeTotalWeight()}%)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-[90%] max-w-6xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Create Video Marking Scheme</h1>
              <Button
                color="light"
                size="sm"
                onClick={closeVideoModalAndUncheck}
                className="text-gray-500 hover:text-gray-700"
              >
                <HiX className="w-5 h-5" />
              </Button>
            </div>

            {/* Current Video Criteria Display */}
            {videoRubric.criteria.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Current Video Criteria ({videoRubric.criteria.length})
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    calculateVideoTotalWeight() === 100 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    Total Weight: {calculateVideoTotalWeight()}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 p-3 font-medium text-gray-800 bg-purple-100 rounded dark:bg-purple-900/30 dark:text-gray-200">
                    <div className="col-span-3">Criterion Name</div>
                    <div className="col-span-3">Low Marks Description</div>
                    <div className="col-span-3">Medium Marks Description</div>
                    <div className="col-span-2">High Marks Description</div>
                    <div className="col-span-1">Weight (%)</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  
                  {videoRubric.criteria.map((criterion, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 p-3 rounded bg-gray-50 dark:bg-gray-700">
                      <div className="col-span-3 font-medium text-gray-800 dark:text-gray-200">
                        {criterion.name}
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.lowDescription}
                      </div>
                      <div className="col-span-3 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.mediumDescription}
                      </div>
                      <div className="col-span-2 text-sm text-gray-600 dark:text-gray-400">
                        {criterion.highDescription}
                      </div>
                      <div className="col-span-1 font-medium text-gray-800 dark:text-gray-200">
                        {criterion.weight}%
                      </div>
                      <div className="col-span-1">
                        <Button
                          color="red"
                          size="xs"
                          onClick={() => removeVideoCriterion(index)}
                        >
                          <HiMinusCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Video Criterion Form */}
            <div className="p-4 mb-6 border border-gray-200 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">Add New Video Criterion</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Criterion Name *
                  </Label>
                  <TextInput
                    type="text"
                    name="name"
                    value={newVideoCriterion.name}
                    onChange={handleVideoCriterionChange}
                    placeholder="e.g., Presentation Quality, Content Clarity"
                    required
                  />
                </div>
                
                <div>
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Weight (%) *
                  </Label>
                  <TextInput
                    type="number"
                    name="weight"
                    value={newVideoCriterion.weight}
                    onChange={handleVideoCriterionChange}
                    placeholder="e.g., 25"
                    min="1"
                    max="100"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Remaining: {100 - calculateVideoTotalWeight()}%
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Low Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="lowDescription"
                    value={newVideoCriterion.lowDescription}
                    onChange={handleVideoCriterionChange}
                    placeholder="Requirements for achieving low marks in this criterion..."
                    required
                  />
                </div>

                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Medium Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="mediumDescription"
                    value={newVideoCriterion.mediumDescription}
                    onChange={handleVideoCriterionChange}
                    placeholder="Requirements for achieving medium marks in this criterion..."
                    required
                  />
                </div>

                <div className="w-1/3">
                  <Label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    High Marks Description *
                  </Label>
                  <Textarea
                    rows="4"
                    name="highDescription"
                    value={newVideoCriterion.highDescription}
                    onChange={handleVideoCriterionChange}
                    placeholder="Requirements for achieving high marks in this criterion..."
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={addVideoCriterion}
                color="purple"
                className="w-full"
                disabled={calculateVideoTotalWeight() >= 100}
              >
                <HiPlusCircle className="w-5 h-5 mr-2" />
                Add Video Criterion
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Alert color="failure" className="mb-4">
                <HiX className="w-5 h-5 mr-2" />
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col justify-end gap-3 sm:flex-row">
              <Button
                color="light"
                onClick={closeVideoModalAndUncheck}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                color="purple"
                onClick={saveVideoRubric}
                className="w-full sm:w-auto"
                disabled={videoRubric.criteria.length === 0 || calculateVideoTotalWeight() !== 100}
              >
                <HiSave className="w-5 h-5 mr-2" />
                Save Video Rubric ({calculateVideoTotalWeight()}%)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAssignment;