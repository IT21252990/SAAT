import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./contexts/ToastContext.jsx";
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
import PrivateRoute from "./components/PrivateRoute.jsx";
import EditAssignment from "./pages/teacher/EditAssignment.jsx";
import VivaDashboard from "./pages/teacher/viva/VivaDashboard.jsx";
// import ReportUpload from "./pages/student/ReportSubmit/ReportUpload.jsx";
import ViewReportSubmission from "./pages/teacher/ViewReportSubmission.jsx";
import GenerateVivaQuestions from "./pages/teacher/viva/GenerateVivaQuestions.jsx";
import SubmitVideo from "./pages/video/SubmitVideo.jsx";
import VideoScreen from "./pages/video/VideoScreen.jsx";

// Create root for React 18+
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <ToastProvider>
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/student-home" element={<StudentHome />} />
          <Route path="/teacher-home" element={<TeacherHome />} />
          <Route path="/module-page/:moduleId" element={<ModulePage />} />
          <Route path="/assignment/:assignmentId" element={<AssignmentPage />} />
          <Route path="/teacher-module-page/:moduleId" element={<TeacherModulePage />} />
          <Route path="/add-assignment" element={<AddAssignment />} />
          <Route path="/view-submissions/:assignmentId" element={<ViewSubmissions />} />
          <Route path="/add-submission/:assignmentId" element={<AddSubmissionPage />} />
          <Route path="/view-code/:codeId" element={<ViewCodeSubmission />} />
          <Route path="/edit-assignment/:assignmentId" element={<EditAssignment />} />
          <Route path="/viva-dashboard/:submissionId" element={<VivaDashboard />} />
          
          {/* <Route path="/report-submission/:assignmentId" element={<ReportUpload />} /> */}
          <Route path="/view-report/:report_id" element={<ViewReportSubmission />} />
          <Route path="/generate-viva-questions/:submissionId" element={<GenerateVivaQuestions />} />
          <Route path="videoSubmission/:assignmentId" element={<SubmitVideo />} />
          <Route path="videoSubmission/video-screen" element={<VideoScreen />} />
        </Route>
      </Routes>
    </Router>
    </ToastProvider>
  </React.StrictMode>
);
