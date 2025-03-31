import logo from "./assets/logoNoText.png";
import icon from "./assets/userIcon.png";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import Dropdown from "react-bootstrap/Dropdown";
import { useState, useEffect } from "react";
import React from "react";
import "bootstrap/dist/css/bootstrap.css";

export default function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser); // Set user info when the user logs in or out
        });

        return () => unsubscribe(); // Cleanup the listener on unmount
    }, []);

    const handleLogout = () => {
        signOut(auth).then(() => {
            window.location.reload();
        });
    };

    return (
        <nav className="nav">
            <img src={logo} alt="logo" className="logo" />

            <ul> 
                <CustomLink to="/">HOME</CustomLink>
                <CustomLink to="/about">ABOUT</CustomLink>
                <CustomLink to="/services">SERVICES</CustomLink>  
                <CustomLink to="/our-team">OUR TEAM</CustomLink> 
                <CustomLink to="/contact">CONTACT</CustomLink>

                {user ? (
                    <CustomLink to="/my-appointments">APPOINTMENTS</CustomLink>
                ) : null}

                {/* Show "Create Trainer" only for the specified email */}
                {(user?.email === "wgrimmer15@gmail.com" || user?.email === "esheiser@loyola.edu") && (
                    <CustomLink to="/admin-dashboard">ADMIN DASHBOARD</CustomLink>
                )}
            </ul>

            {user ? (
                <div className="user">
                    <Dropdown>
                        <Dropdown.Toggle className="user-info">
                            {user.email} 
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item href="/manage-profile">Manage Profile</Dropdown.Item>
                            <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            ) : (
                <ul className="btn-signin">
                    <img src={icon} alt="icon" className="icon" height={50} width={50} />
                    <Link to="/login" className="signin">SIGN IN</Link>
                </ul>
            )}
        </nav>
    );
}

function CustomLink({ to, children, ...props }) {
    const resolvedPath = useResolvedPath(to);
    const isActive = useMatch({ path: resolvedPath.pathname, end: true });
    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    );
}
