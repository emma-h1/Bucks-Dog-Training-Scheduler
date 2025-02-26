// ProtectedRoute.js
import { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth); // Get the current user
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.email !== "wgrimmer15@gmail.com") {
      // If the user is not the administrator, redirect to the home page
      navigate("/");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading spinner while checking the user
  }

  // If the user is the administrator, render the children (e.g., the CreateTrainer page)
  return user?.email === "wgrimmer15@gmail.com" ? children : null;
};

export default ProtectedRoute;