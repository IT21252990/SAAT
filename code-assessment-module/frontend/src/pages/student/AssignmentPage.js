import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../../firebase"; // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth";

const AssignmentPage = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { moduleId, moduleName } = location.state || {}; // Retrieve passed state
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [student_id, setStudent_id] = useState(null);

  useEffect(() => {
    // Check for logged-in user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setStudent_id(user.uid); // Set the logged-in user ID
      } else {
        setStudent_id(null);
        setError("User not logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/assignment/getAssignment/${assignmentId}`
        );
        const data = await response.json();

        if (response.ok) {
          setAssignment(data);
        } else {
          setError(data.error || "Assignment not found!");
        }
      } catch (error) {
        setError("Failed to fetch assignment: " + error.message);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleCreateSubmission = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/submission/create-submission`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: student_id,
            assignment_id: assignmentId,
            code_id: null,
            report_id: null,
            video_id: null,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        navigate(`/submission/${data.submission_id}`, {
          state: { submissionId: data.submission_id },
        });
      } else {
        setError(data.error || "Failed to create submission.");
      }
    } catch (error) {
      setError("Error creating submission: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : assignment ? (
        <>
          <h2>{assignment.name}</h2>
          <p>
            <strong>Module:</strong> {moduleName || "Unknown Module"}
          </p>
          <h3>Marking Criteria</h3>
          <ul>
            {assignment.marking && assignment.marking.length > 0 ? (
              assignment.marking.map((criteria, index) => (
                <li key={index}>
                  <strong>{criteria.criteria}:</strong>{" "}
                  {criteria.allocated_mark} marks
                </li>
              ))
            ) : (
              <p>No marking criteria available.</p>
            )}
          </ul>

          <h3>Submit Your Work</h3>
          
          <button onClick={handleCreateSubmission} disabled={loading}>
            {loading ? "Submitting..." : "Submit Code"}
          </button>

          <button onClick={() => alert("Upload Report")}>Submit Report</button>
          <button onClick={() => alert("Upload Video")}>Submit Video</button>
        </>
      ) : (
        <p>Loading assignment details...</p>
      )}
    </div>
  );
};

export default AssignmentPage;
