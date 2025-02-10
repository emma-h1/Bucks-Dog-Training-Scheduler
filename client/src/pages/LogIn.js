import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Import the firebase configuration
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, getIdToken } from "firebase/auth"; // Import getIdToken
import logo from "../assets/logoNoText.png";
// import "./SignUp.css";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Set persistence to local to ensure user stays logged in even after closing the browser
      await setPersistence(auth, browserLocalPersistence);

      // Sign in with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);

      // After successful login, retrieve the ID token
      const user = auth.currentUser;
      if (user) {
        const idToken = await getIdToken(user); // Retrieve Firebase ID token

        // Now, send the token to the server with the request
        const response = await fetch("/protected", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`, // Send the token in the request header
          },
        });

        // Optionally, handle the response here (e.g., navigate or display a message)
        if (response.ok) {
          navigate("/"); // Redirect to dashboard after successful login
        } else {
          setError("Failed to fetch protected route");
        }
      }
    } catch (err) {
      setError(err.message); // Display any error message (e.g., incorrect email/password)
    }
  };

  return (
    <div className="container-signin">
      <img
        src={logo}
        alt="Logo"
        height={250}
        width={250}
        style={{ alignSelf: "center" }}
        className="mt-5 pt-3"
      />

      <div className="title">
        <h1>Log In</h1>
      </div>

      <div className="form-signin">
        <form onSubmit={handleLogin}>
          {error && <p className="error-message">{error}</p>} {/* Display error message */}

          {/* Email input */}
          <div className="input">
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password input */}
          <div className="input">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Log In button */}
          <button className="btn btn-success" type="submit">
            Log In
          </button>

          {/* Forgot password and return to sign-up links */}
          <div className="forgot-password">
            <p>
              Forgot Password?
              <Link to="/reset-password"> Reset Password</Link>
            </p>
          </div>

          <div className="return-SignIn">
            <p>
              Don't have an account? 
              <span>
                <Link to="/signin"> Sign Up</Link>
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
