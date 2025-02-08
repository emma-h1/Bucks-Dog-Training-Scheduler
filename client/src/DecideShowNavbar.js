import { useLocation } from "react-router-dom"
import React, { useEffect, useState } from "react"

const DecideShowNavbar = ({ children }) => {

    const location = useLocation();
    const [showNavbar, setShowNavbar] = useState(true)

    useEffect(() => {
        console.log('location: ', location)
        if(location.pathname === "/signin") {
            setShowNavbar(false)
        } else {
            setShowNavbar(true)
        }
        }, [location])

    return (
        <div>{showNavbar && children}</div>
    )
}

export default DecideShowNavbar