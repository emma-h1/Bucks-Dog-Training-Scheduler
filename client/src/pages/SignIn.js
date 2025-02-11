import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import logo from "../assets/logoNoText.png";
import "./SignIn.css";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      
      await axios.post("http://localhost:4999/api/auth/register", { //**FIX THIS URL */
        uid: user.uid,
        firstName,
        lastName,
        username,
        email,
      });

      navigate("/"); // Redirect user after sign-up
    } catch (err) {
      setError(err.message);
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
        <h1>Sign Up</h1>
      </div>

      <div className="form-signin">
        <form onSubmit={handleSignUp}>
          {error && <p className="error-message">{error}</p>}

          <div className="input">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-success" type="submit">
            Create Account
          </button>

          <div className="login">
            <p>Already a user? 
              <span>
                <Link to="/login"> Login</Link>
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
