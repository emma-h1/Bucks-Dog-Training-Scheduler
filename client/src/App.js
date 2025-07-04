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
import MyAppointments from './pages/MyAppointments.js';
import OurTeam from './pages/OurTeam.js';
import AdminDashboard from './pages/AdminDashboard.js';
import ManageUsers from './pages/ManageUsers.js';
import ManageTrainers from './pages/ManageTrainers.js';
import ManageProfile from './pages/ManageProfile.js';
import ManageGallery from './pages/ManageGallery.js';
import { Route, Routes, useNavigate } from "react-router-dom";
import DecideShowNavbar from './DecideShowNavbar.js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Footer from './Footer.js';

// ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth); // Get the current user
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.email !== "wgrimmer15@gmail.com" && user?.email !== "esheiser@loyola.edu") {
      // If the user is not the administrator, redirect to the home page
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner while checking the user
  }

  // If the user is the administrator, render the children (e.g., the CreateTrainer page)
  return user?.email === "wgrimmer15@gmail.com" || user?.email === "esheiser@loyola.edu" ? children : null;
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

      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/our-team" element={<OurTeam />} />
          <Route path="/manage-profile" element={<ManageProfile />} />

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
            path="/manage-gallery"
            element={
              <ProtectedRoute>
                <ManageGallery />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
                </ProtectedRoute>
            }
          />

        </Routes>
      </div>
      <div>
        < Footer />
      </div>
    </>
  );
}

export default App;