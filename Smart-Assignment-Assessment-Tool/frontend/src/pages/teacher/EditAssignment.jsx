import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { Button, Label, TextInput, Textarea, Checkbox } from "flowbite-react";

const EditAssignment = () => {
  const { assignmentId } = useParams(); // Get assignmentId from URL params
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");

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
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
  
    if (!assignment) {
      setError("Assignment data is not available.");
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
        navigate(`/teacher-module-page/${assignment.module_id}`);
      } else {
        setError(data.error || "Failed to update assignment.");
      }
    } catch (error) {
      setError("Failed to update assignment: " + error.message);
    }
  };
  

  if (!assignment) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="mb-10 mt-10 w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Edit Assignment
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Assignment Details */}
          <div>
            <Label>Assignment Name:</Label>
            <TextInput
              type="text"
              name="name"
              value={assignment.name}
              onChange={(e) =>
                setAssignment({ ...assignment, name: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Description:</Label>
            <Textarea
              name="description"
              value={assignment.description}
              onChange={(e) =>
                setAssignment({ ...assignment, description: e.target.value })
              }
              required
            />
          </div>

          <div>
            <Label>Deadline:</Label>
            <TextInput
              type="date"
              name="deadline"
              value={assignment.deadline}
              onChange={(e) =>
                setAssignment({ ...assignment, deadline: e.target.value })
              }
              required
            />
          </div>

          {/* Submission Types */}
          <div>
            <Label>Submission Types:</Label>
            <div className="flex space-x-4">
              {" "}
              {/* Use flexbox to align checkboxes horizontally */}
              <div className="flex items-center">
                <Checkbox
                  name="code"
                  checked={assignment.submission_types.code}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      submission_types: {
                        ...assignment.submission_types,
                        code: e.target.checked,
                      },
                    })
                  }
                />
                <Label className="ml-2">Code</Label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  name="report"
                  checked={assignment.submission_types.report}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      submission_types: {
                        ...assignment.submission_types,
                        report: e.target.checked,
                      },
                    })
                  }
                />
                <Label className="ml-2">Report</Label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  name="video"
                  checked={assignment.submission_types.video}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      submission_types: {
                        ...assignment.submission_types,
                        video: e.target.checked,
                      },
                    })
                  }
                />
                <Label className="ml-2">Video</Label>
              </div>
            </div>
          </div>

          {/* Marking Criteria
          <div>
            <Label>Marking Criteria:</Label>
            <div className="space-y-2">
              <div>
                <Label>Code Marking Criteria:</Label>
                <Textarea
                  name="code_criteria"
                  value={assignment.marking_criteria.code}
                  onChange={(e) => setAssignment({ 
                    ...assignment, 
                    marking_criteria: { ...assignment.marking_criteria, code: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Report Marking Criteria:</Label>
                <Textarea
                  name="report_criteria"
                  value={assignment.marking_criteria.report}
                  onChange={(e) => setAssignment({ 
                    ...assignment, 
                    marking_criteria: { ...assignment.marking_criteria, report: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Video Marking Criteria:</Label>
                <Textarea
                  name="video_criteria"
                  value={assignment.marking_criteria.video}
                  onChange={(e) => setAssignment({ 
                    ...assignment, 
                    marking_criteria: { ...assignment.marking_criteria, video: e.target.value }
                  })}
                />
              </div>
            </div>
          </div> */}

          <div className="mt-4 flex space-x-4">
            <Button type="submit" color="blue">
              Update Assignment
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

export default EditAssignment;
