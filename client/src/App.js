import React, { useEffect, useState } from 'react';
import Navbar from "./Navbar";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import LogIn from "./pages/LogIn";
import ResetPassword from "./pages/ResetPassword";
import ManageServices from './pages/ManageServices.js';
import ManageAppointments from './pages/ManageAppointments.js';
import Calendar from './pages/Calendar.js';
import OurTeam from './pages/OurTeam.js';
import AdminDashboard from './pages/AdminDashboard.js';
import ManageUsers from './pages/ManageUsers.js';
import ManageTrainers from './pages/ManageTrainers.js';
import { Route, Routes, useNavigate } from "react-router-dom";
import DecideShowNavbar from './DecideShowNavbar.js';
import CreateTrainer from './pages/CreateTrainer.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth); // Get the current user
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.email !== "wgrimmer15@gmail.com" || user?.email !== "esheiser@loyola.edu") {
      // If the user is not the administrator, redirect to the home page
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner while checking the user
  }

  // If the user is the administrator, render the children (e.g., the CreateTrainer page)
  return user?.email === "wpgrimmer15@gmail.com" ? children : null;
};

function App() {
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch('http://localhost:4999/api')
      .then(response => response.json())
      .then(data => setBackendData(data));
  }, []);

  return (
    <>
      <DecideShowNavbar>
        <Navbar />
      </DecideShowNavbar>

      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/our-team" element={<OurTeam />} />

          <Route 
            path="/manage-services" 
            element={
              <ProtectedRoute>
                <ManageServices />
              </ProtectedRoute>
            }
            />

          <Route 
            path="/manage-appointments" 
            element={
              <ProtectedRoute>
                <ManageAppointments />
              </ProtectedRoute>
            } 
            />
          
          <Route
            path="/create-trainer"
            element={
              <ProtectedRoute>
                <CreateTrainer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-users"
            element={
              <ProtectedRoute>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manage-trainers"
            element={
              <ProtectedRoute>
                <ManageTrainers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              
                <AdminDashboard />
              
            }
          />

        </Routes>
      </div>
    </>
  );
}

export default App;