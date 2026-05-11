import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard";
<<<<<<< HEAD
import MyTask    from "./pages/MyTask";  
=======
import FocusTimer from "./pages/FocusTimer";
>>>>>>> 33b474048959fe3b5faa3e0c884ccb92255aaf95


export default function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
<<<<<<< HEAD
        <Route path="/tasks"     element={<MyTask />} /> 
=======
        <Route path="/focus-timer" element={<FocusTimer />} />
>>>>>>> 33b474048959fe3b5faa3e0c884ccb92255aaf95
      </Routes>

    </BrowserRouter>
  );
}