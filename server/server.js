const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const { getFirestore } = require("firebase-admin/firestore");

const app = express();
app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(require("./bucksdogtraining-82a35-firebase-adminsdk-fbsvc-4fff37689c.json")),
});

const db = getFirestore();

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

// User Registration Route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { uid, firstName, lastName, username, email } = req.body;

    // Store user data in Firestore
    await db.collection("users").doc(uid).set({
      firstName,
      lastName,
      username,
      email,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Failed to save user data" });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: 'Hello' });
});

// Protected route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

const PORT = 4999;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Endpoint to fetch ServicesLibrary
app.get('/api/ServiceLibrary', async (req, res) => {
  try {
    console.log('Fetching ServiceLibrary collection...');
    const servicesCollection = db.collection('ServiceLibrary');
    const servicesSnapshot = await servicesCollection.get();
    console.log('Number of documents:', servicesSnapshot.size);
    const servicesData = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(servicesData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});