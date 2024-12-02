import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProjectFileSubmission = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    student_name: "",
    student_id: "",
    year: "",
    semester: "",
    module_name: "",
    module_code: "",
  });

  const [file, setFile] = useState(null); // For file upload
  const [isHovered, setIsHovered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload a project file.");
      return;
    }

    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      submissionData.append(key, formData[key]);
    });
    submissionData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/submit`,
        submissionData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(response.data.message);
      navigate("/submission-type");
    } catch (error) {
      alert("Error uploading data: " + error.response?.data?.error || error.message);
    }
  };

  const handleCancel = () => {
    navigate("/submission-type");
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    maxWidth: "500px",
    margin: "auto",
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const inputStyle = {
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "16px",
    width: "95%",
  };

  const labelStyle = {
    marginBottom: "5px",
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
  };

  const buttonStyle = {
    padding: "12px",
    backgroundColor: "#50c5ff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: "#489fcb",
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    marginTop: "10px",
    backgroundColor: "#f44336",
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      {Object.keys(formData).map((field) => (
        <div key={field}>
          <label style={labelStyle}>
            {field.replace("_", " ").toUpperCase()}:
          </label>
          <input
            type="text"
            name={field}
            value={formData[field]}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
      ))}
      <div>
        <label style={labelStyle}>Project File (ZIP):</label>
        <input type="file" accept=".zip" onChange={handleFileChange} style={inputStyle} required />
      </div>
      <button
        type="submit"
        style={isHovered ? buttonHoverStyle : buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Submit
      </button>
      <button type="button" style={cancelButtonStyle} onClick={handleCancel}>
        Cancel
      </button>
    </form>
  );
};

export default ProjectFileSubmission;
