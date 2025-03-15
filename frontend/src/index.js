import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from "./pages/user/ForgotPassword";
import StudentHome from "./pages/student/StudentHome"
import TeacherHome from "./pages/teacher/TeacherHome";
import ModulePage from "./pages/student/ModulePage";
import AssignmentPage from "./pages/student/AssignmentPage";
import TeacherModulePage from "./pages/teacher/TeacherModulePage";
import AddAssignment from "./pages/teacher/AddAssignment";

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
      </Routes>
    </Router>
  </React.StrictMode>
);
