import React, { useEffect, useState } from "react";

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL =  `${import.meta.env.VITE_BACKEND_URL}/project/getFullWebsiteDetails`;

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setData(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Loading dashboard data...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!data) return <p>No data available.</p>;

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Admin Dashboard</h1>

      {/* Modules Section */}
      <section>
        <h2>Modules ({data.modules.length})</h2>
        {data.modules.length === 0 && <p>No modules found.</p>}
        {data.modules.map((module) => (
          <div
            key={module.module_id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              marginBottom: 16,
              padding: 12,
            }}
          >
            <h3>{module.name}</h3>
            <p>
              <b>Enroll Key:</b> {module.enroll_key} | <b>Semester:</b>{" "}
              {module.semester} | <b>Year:</b> {module.year}
            </p>

            {/* Assignments */}
            <div style={{ marginLeft: 16 }}>
              <h4>Assignments ({module.assignments.length})</h4>
              {module.assignments.length === 0 && <p>No assignments found.</p>}
              {module.assignments.map((assignment) => (
                <div
                  key={assignment.assignment_id}
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 6,
                    marginBottom: 10,
                    padding: 8,
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <strong>{assignment.name}</strong> (Deadline:{" "}
                  {assignment.deadline})
                  <p>{assignment.description}</p>

                  {/* Submission types */}
                  <p>
                    Submission Types:{" "}
                    {Object.entries(assignment.submission_types)
                      .filter(([, allowed]) => allowed)
                      .map(([type]) => type)
                      .join(", ") || "None"}
                  </p>

                  {/* Submissions */}
                  <div style={{ marginLeft: 12 }}>
                    <h5>Submissions ({assignment.submissions.length})</h5>
                    {assignment.submissions.length === 0 && (
                      <p>No submissions yet.</p>
                    )}
                    {assignment.submissions.map((submission) => (
                      <div
                        key={submission.submission_id}
                        style={{
                          border: "1px solid #ddd",
                          borderRadius: 4,
                          padding: 6,
                          marginBottom: 6,
                          backgroundColor: "#fff",
                        }}
                      >
                        <p>
                          <b>Student ID:</b> {submission.student_id}
                        </p>
                        <p>
                          <b>Status:</b> {submission.status} |{" "}
                          <b>Created At:</b>{" "}
                          {new Date(submission.created_at).toLocaleString()}
                        </p>
                        <p>
                          <b>Report ID:</b> {submission.report_id || "N/A"} |{" "}
                          <b>Code ID:</b> {submission.code_id || "N/A"} |{" "}
                          <b>Video ID:</b> {submission.video_id || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Users Section */}
      <section style={{ marginTop: 40 }}>
        <h2>Users ({data.users.length})</h2>
        {data.users.length === 0 && <p>No users found.</p>}
        <table
          border="1"
          cellPadding="6"
          cellSpacing="0"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead style={{ backgroundColor: "#eee" }}>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>UID</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <tr key={user.uid}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.uid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default DashboardPage;
