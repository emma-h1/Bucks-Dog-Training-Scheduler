import React, {useEffect, useState} from 'react';
import Navbar from"./Navbar"
import About from "./pages/About"
import Contact from "./pages/Contact"
import Services from "./pages/Services"
import SignIn from "./pages/SignIn"
import Home from "./pages/Home"
import LogIn from "./pages/LogIn"
import { Route, Routes } from "react-router-dom"
import DecideShowNavbar from './DecideShowNavbar.js';

function App() {

  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch('/api')
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
        </Routes>
      </div>
      </>
    )

}

export default App