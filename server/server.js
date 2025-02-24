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

//  Create a service
app.post('/api/ServiceLibrary', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const newService = await db.collection('ServiceLibrary').add({
      name,
      description,
      price,
    });
    
    res.status(201).json({ id: newService.id });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update a service
app.put('/api/ServiceLibrary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    
    await db.collection('ServiceLibrary').doc(id).update({
      name,
      description,
      price,
    });
    
    res.json({ message: 'Service updated successfully' });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete a service
app.delete('/api/ServiceLibrary/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('ServiceLibrary').doc(id).delete();
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// Endpoint to fetch appointments
app.get('/api/appointments', async (req, res) => {
  try {
    console.log('Fetching appointments...');
    const appointmentsCollection = db.collection('appointments');
    const appointmentsSnapshot = await appointmentsCollection.get();
    console.log('Number of documents:', appointmentsSnapshot.size);
    const appointmentsData = appointmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(appointmentsData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// create appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const { dog, owner, trainer, date, location, dropoffTime, pickupTime, purpose, balanceDue } = req.body;
    const newAppointment = await db.collection('appointments').add({
      dog, owner, trainer, date, location, dropoffTime, pickupTime, purpose, balanceDue
    });
    res.status(201).json({ id: newAppointment.id });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update an appointment
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dog, owner, trainer, date, location, dropoffTime, pickupTime, purpose, balanceDue } = req.body;
    
    await db.collection('appointments').doc(id).update({
      dog, owner, trainer, date, location, dropoffTime, pickupTime, purpose, balanceDue
    });
    
    res.json({ message: 'appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Delete an appointment
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('appointments').doc(id).delete();
    res.json({ message: 'appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});