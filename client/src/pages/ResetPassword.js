import { useState } from "react";
import { auth } from "../firebase"; // Import the firebase configuration
// import "./SignUp.css";
import logo from "../assets/logoNoText.png";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");


  const handleReset = async (e) => {
    e.preventDefault();

    sendPasswordResetEmail(auth, email)
    .then(() => {
        // Password reset email sent!
        alert("Email sent.")
    })
    .catch((error) => {
        setError("Cannot send email");
    });
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
        <h1>Reset Password</h1>
      </div>

      <div className="form-signin">
        <form onSubmit={handleReset}>
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


          {/* Log In button */}
          <button className="btn btn-success" type="submit">
            Submit
          </button>

        </form>
      </div>
      <div className="login">
            <p>Return to login:
              <span>
                <Link to="/login"> Login</Link>
              </span>
            </p>
          </div>
    </div>
  );
}