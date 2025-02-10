const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(require("./bucksdogtraining-82a35-firebase-adminsdk-fbsvc-4fff37689c.json")),
});

// Middleware to verify Firebase authentication token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Store user info in request
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

// Protected route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

const PORT = 4999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
