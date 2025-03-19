import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Button, Label, TextInput, Textarea, Checkbox, Card, Spinner, Alert } from "flowbite-react";
import { HiPencilAlt, HiCalendar, HiDocumentText, HiCode, HiVideoCamera, HiX, HiCheck } from "react-icons/hi";

const EditAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/assignment/getAssignment/${assignmentId}`,
        );
        const data = await response.json();

        if (response.ok) {
          setAssignment(data);
        } else {
          setError(data.error || "Assignment not found!");
        }
      } catch (error) {
        setError("Failed to fetch assignment details: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    if (!assignment) {
      setError("Assignment data is not available.");
      setLoading(false);
      return;
    }
  
    const updatedAssignment = {
      ...assignment,
      name: e.target.name?.value || assignment.name,
      description: e.target.description?.value || assignment.description,
      deadline: e.target.deadline?.value || assignment.deadline,
      submission_types: {
        code: e.target.code?.checked ?? assignment.submission_types?.code ?? false,
        report: e.target.report?.checked ?? assignment.submission_types?.report ?? false,
        video: e.target.video?.checked ?? assignment.submission_types?.video ?? false,
      },
      marking_criteria: {
        code: e.target.code_criteria?.value || assignment.marking_criteria?.code || "",
        report: e.target.report_criteria?.value || assignment.marking_criteria?.report || "",
        video: e.target.video_criteria?.value || assignment.marking_criteria?.video || "",
      },
    };
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/assignment/updateAssignment/${assignmentId}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedAssignment),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
  
      if (response.ok) {
        setSuccessMessage("Assignment updated successfully!");
        setTimeout(() => {
          navigate(`/teacher-module-page/${assignment.module_id}`);
        }, 1500);
      } else {
        setError(data.error || "Failed to update assignment.");
      }
    } catch (error) {
      setError("Failed to update assignment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <div className="flex flex-col items-center justify-center p-8">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
        <Header />
      </div>
      <div className="container px-4 py-8 pt-20 mx-auto">
      {/* Main content with padding to account for fixed header */}
      <Card className="w-full mt-8 mb-10 shadow-lg animate-slide-in-right">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 dark:text-white">
            <HiPencilAlt className="mr-2 text-primary-600" />
            Edit Assignment
          </h2>
          <Button className="bg-red-300 dark:text-red-500" color="gray" pill onClick={() => navigate(-1)}>
            <HiX className="w-5 h-5 mr-2" />
            Cancel
          </Button>
        </div>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert color="success" className="mb-4 animate-pulse">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          {/* Assignment Details */}
          <div className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <div className="mb-4">
              <Label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Assignment Name
              </Label>
              <TextInput
                id="name"
                name="name"
                value={assignment?.name || ""}
                onChange={(e) => setAssignment({ ...assignment, name: e.target.value })}
                className="focus:ring-primary-500"
                required
                icon={HiPencilAlt}
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={assignment?.description || ""}
                onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
                className="focus:ring-primary-500"
                required
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="deadline" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Deadline
              </Label>
              <div className="relative">
                <TextInput
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={assignment?.deadline || ""}
                  onChange={(e) => setAssignment({ ...assignment, deadline: e.target.value })}
                  className="focus:ring-primary-500"
                  required
                  icon={HiCalendar}
                />
              </div>
            </div>
          </div>

          {/* Submission Types */}
          <div className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
            <Label className="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Submission Types
            </Label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center p-3 space-x-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900">
                  <HiCode className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <Label htmlFor="code" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Code
                  </Label>
                  <Checkbox
                    id="code"
                    name="code"
                    checked={assignment?.submission_types?.code || false}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        submission_types: {
                          ...assignment.submission_types,
                          code: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center p-3 space-x-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full dark:bg-green-900">
                  <HiDocumentText className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <Label htmlFor="report" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Report
                  </Label>
                  <Checkbox
                    id="report"
                    name="report"
                    checked={assignment?.submission_types?.report || false}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        submission_types: {
                          ...assignment.submission_types,
                          report: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center p-3 space-x-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full dark:bg-purple-900">
                  <HiVideoCamera className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div className="flex items-center justify-between flex-1">
                  <Label htmlFor="video" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Video
                  </Label>
                  <Checkbox
                    id="video"
                    name="video"
                    checked={assignment?.submission_types?.video || false}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        submission_types: {
                          ...assignment.submission_types,
                          video: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-4">
            <Button 
              type="submit" 
              color="blue"
              disabled={loading}
              className="px-6 py-2.5 font-medium transition-all duration-200 ease-in-out hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <HiCheck className="w-5 h-5 mr-2" />
                  Update Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
};

export default EditAssignment;