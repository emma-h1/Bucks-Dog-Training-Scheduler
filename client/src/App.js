import React, {useEffect, useState} from 'react';
import Navbar from"./Navbar"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Services from "./pages/Services"
import SignIn from "./pages/SignIn"
import Home from "./pages/Home"
import LogIn from "./pages/LogIn"
import ResetPassword from "./pages/ResetPassword"
import ManageServices from './pages/ManageServices.js';
import ManageAppointments from './pages/ManageAppointments.js';
import { Route, Routes } from "react-router-dom"
import DecideShowNavbar from './DecideShowNavbar.js';

function App() {

  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch('http://localhost:4999/api')
      .then(response => response.json())
      .then(data=>setBackendData(data))
  },[])

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
          <Route path="/manage-services" element={<ManageServices />} />
          <Route path="/manage-appointments" element={<ManageAppointments />} />
        </Routes>
      </div>
      </>
    )

}

export default App