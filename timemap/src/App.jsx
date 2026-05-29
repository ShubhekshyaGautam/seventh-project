import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard";
import MyTask    from "./pages/MyTask";  
import FocusTimer from "./pages/FocusTimer";
import Calendar from "./pages/Calendar";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";


import TaskDetail from "./pages/TaskDetail";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tasks"     element={<MyTask />} /> 
        <Route path="/tasks/:id" element={<TaskDetail />} /> 
        <Route path="/analytics" element={<Analytics />} /> 
       <Route path="/timer" element={<FocusTimer />} />
       <Route path="/calendar" element={<Calendar />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>

    </BrowserRouter>
  );
}