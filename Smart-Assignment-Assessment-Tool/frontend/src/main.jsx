import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/user/Login.jsx";
import Register from "./pages/user/Register.jsx";
import ForgotPassword from "./pages/user/ForgotPassword";
import StudentHome from "./pages/student/StudentHome"
import TeacherHome from "./pages/teacher/TeacherHome";
import ModulePage from "./pages/student/ModulePage";
import AssignmentPage from "./pages/student/AssignmentPage";
import TeacherModulePage from "./pages/teacher/TeacherModulePage";
import AddAssignment from "./pages/teacher/AddAssignment";
import ViewSubmissions from "./pages/teacher/ViewSubmissions";
import AddSubmissionPage from "./pages/student/AddSubmissionPage";
import ViewCodeSubmission from "./pages/teacher/ViewCodeSubmission.jsx";

// Create root for React 18+
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/student-home" element={<StudentHome />} />
        <Route path="/teacher-home" element={<TeacherHome />} />
        <Route path="/module-page/:moduleId" element={<ModulePage />} />
        <Route path="/assignment/:assignmentId" element={<AssignmentPage />} />
        <Route path="/teacher-module-page/:moduleId" element={<TeacherModulePage />} />
        <Route path="/add-assignment" element={<AddAssignment />} />
        <Route path="/view-submissions/:assignmentId" element={<ViewSubmissions />} />
        <Route path="/add-submission/:submissionId" element={<AddSubmissionPage />} />
        <Route path="/view-code/:codeId" element={<ViewCodeSubmission />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
