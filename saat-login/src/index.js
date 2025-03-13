import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import StudentHome from "./pages/StudentHome";
import TeacherHome from "./pages/TeacherHome";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/student-home" element={<StudentHome />} />
      <Route path="/teacher-home" element={<TeacherHome />} />
    </Routes>
  </Router>,
  document.getElementById("root")
);
