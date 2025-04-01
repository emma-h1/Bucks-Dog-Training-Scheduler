import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import axios from "axios"; 

import { Modal, Button } from 'react-bootstrap';

const CreateTrainer = ({show, onHide, onCreate }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [adminPassword, setAdminPassword] = useState(""); // State for admin password input
  const [isPasswordPromptVisible, setIsPasswordPromptVisible] = useState(false); // Toggle visibility for password prompt

  const handleClose = () => {
    resetForm();
    onHide();
  }

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setAdminPassword(""); // Reset admin password field
    setIsPasswordPromptVisible(false); // Hide the password input field
  }

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const adminEmail = "wgrimmer15@gmail.com"; // Will change in futute to check for ADMIN bool
      const currentUser = auth.currentUser;

      if (currentUser && currentUser.email === adminEmail) {
        if (!adminPassword) {
          setIsPasswordPromptVisible(true);
          return; 
        }

        
        await signOut(auth);

        // Trainer creation call
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await axios.post("http://localhost:4999/api/auth/registerTrainer", { 
          uid: user.uid,
          firstName,
          lastName,
          username,
          email,
        });

        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        //resets all fields to blank

        setSuccessMessage("Trainer account created successfully! Administrator session restored.");
        
        onCreate();

      } else {
        setError("Only the administrator can create new trainer accounts.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Create Trainer</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="container-signin">
          {isPasswordPromptVisible && ( //small value button as popup did not keep password hidden
            <div className="password-prompt">
              <input
                type="password"
                placeholder="Please enter your password to confirm your identity"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
              <button
                className="btn btn-primary"
                onClick={handleSignUp}
              >
                Confirm Identity
              </button>
            </div>
          )}

          <div className="form-signin">
            <form onSubmit={handleSignUp}>
              {error && <p className="error-message">{error}</p>}
              {successMessage && <p className="success-message">{successMessage}</p>}

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
                  type="password" // Password field (hidden)
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="input">
                <input
                  type="password" // Confirm Password field (hidden)
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <Button variant="secondary" onClick={handleClose} className="m-2">
                  Cancel
                </Button>
                <button className="btn btn-success" type="submit">
                  Create Trainer Account
                </button>
              </div>

              <div className="login">
              </div>
            </form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default CreateTrainer;