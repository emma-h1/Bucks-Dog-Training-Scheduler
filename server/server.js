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
      dogs: [],
      createdAt: new Date(),
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ error: "Failed to save user data" });
  }
});

app.post("/api/auth/registerTrainer", async (req, res) => {
  try {
    const { uid, firstName, lastName, username, email} = req.body;

    // Store trainer data in Firestore under "trainers" collection
    await db.collection("trainers").doc(uid).set({
      firstName,
      lastName,
      username,
      email,
      createdAt: new Date(),
    });

    res.status(201).json({ message: "Trainer registered successfully!" });
  } catch (error) {
    console.error("Error saving trainer:", error);
    res.status(500).json({ error: "Failed to save trainer data" });
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


// Endpoint to fetch trainers
app.get('/api/trainers', async (req, res) => {
  try {
    console.log('Fetching trainers collection...');
    const trainersCollection = db.collection('trainers');
    const trainersSnapshot = await trainersCollection.get();

    const trainersData = trainersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(trainersData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trainer' });
  }
});

// create trainer
app.post('/api/trainers', async (req, res) => {
  try {
    const { username, firstName, lastName, email, bio } = req.body;
    const newTrainer = await db.collection('trainers').add({
      username, firstName, lastName, email, bio
    });
    res.status(201).json({ id: newTrainer.id });
  } catch (error) {
    console.error('Error creating trainer:', error);
    res.status(500).json({ error: 'Failed to create trainer' });
  }
});

// Update a trainer
app.put('/api/trainers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, email, bio } = req.body;
    
    await db.collection('trainers').doc(id).update({
      username, firstName, lastName, email, bio
    });
    
    res.json({ message: 'trainer updated successfully' });
  } catch (error) {
    console.error('Error updating trainer:', error);
    res.status(500).json({ error: 'Failed to update trainer' });
  }
});

// Delete a trainer
app.delete('/api/trainers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('trainers').doc(id).delete();
    res.json({ message: 'trainer deleted successfully' });
  } catch (error) {
    console.error('Error deleting trainer:', error);
    res.status(500).json({ error: 'Failed to delete trainer' });
  }
});


// Endpoint to fetch specific user
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection('users').doc(id).get();
    console.log(userDoc.data());
    res.json(userDoc.data());
  } catch (err) {
    console.log('cannot get user');
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update a user
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, email } = req.body;
    
    await db.collection('users').doc(id).update({
      username, firstName, lastName, email
    });
    
    res.json({ message: 'user updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).delete();
    res.json({ message: 'user deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Endpoint to fetch specific dog
app.get('/api/dogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dogDoc = await db.collection('dogs').doc(id).get();
    console.log('dogs');
    console.log(dogDoc.data());
    res.json(dogDoc.data());
  } catch (err) {
    console.log('cannot get dog');
    res.status(500).json({ error: 'Failed to fetch dog' });
  }
});

// Update a dog
app.put('/api/dogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalInfo, age, breed, name, ownerID, weight } = req.body;
    
    await db.collection('dogs').doc(id).update({
      additionalInfo, age, breed, name, ownerID, weight
    });
    
    res.json({ message: 'dog updated successfully' });
  } catch (error) {
    console.error('Error updating dog:', error);
    res.status(500).json({ error: 'Failed to update dog' });
  }
});

// Delete a dog
app.delete('/api/dogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('dogs').doc(id).delete();
    res.json({ message: 'dog deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog:', error);
    res.status(500).json({ error: 'Failed to delete dog' });
  }
});

// Endpoint to get dogs by ownerID
app.get('/api/dogs', async (req, res) => {
  const ownerID = req.query.ownerID; // Get ownerID from query parameter

  try {
    // Query Firestore for dogs where ownerID matches
    const dogsRef = db.collection('dogs');
    const querySnapshot = await dogsRef.where('ownerID', '==', ownerID).get();

    const dogs = [];
    querySnapshot.forEach((doc) => {
      dogs.push({ id: doc.id, ...doc.data() }); // Include document ID and data
    });

    res.json(dogs); // Return the filtered dogs
  } catch (err) {
    console.error('Failed to fetch dogs:', err);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// Endpoint to remove a dog from a user's dogs array
app.delete('/api/users/:userId/dogs/:dogId', async (req, res) => {
  const { userId, dogId } = req.params; // Get user ID and dog ID from URL parameters

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    const userData = userDoc.data();


    // Remove the dog ID from the user's dogs array
    const updatedDogs = userData.dogs.filter(id => id !== dogId);
    console.log('deleted dog');
    console.log(updatedDogs);
    await userRef.update({ dogs: updatedDogs });

    res.json({ message: 'Dog removed successfully' });
  } catch (err) {
    console.error('Failed to remove dog:', err);
    res.status(500).json({ error: 'Failed to remove dog' });
  }
});

app.post('/api/dogs', async (req, res) => {
  const { name, age, breed, weight, additionalInfo, ownerID } = req.body;

  try {
    const dogRef = await db.collection('dogs').add({
      name,
      age,
      breed,
      weight,
      additionalInfo,
      ownerID
    });
    res.json({ id: dogRef.id, message: 'Dog added successfully' });
  } catch (err) {
    console.error('Failed to add dog:', err);
    res.status(500).json({ error: 'Failed to add dog' });
  }
});

app.patch('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { dogs } = req.body; // Expect the updated dogs array

  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    // Get the current dogs array
    const userData = userDoc.data();
    const currentDogs = userData.dogs || [];
    
    // Merge the new dog IDs with the existing array (avoid duplicates)
    const updatedDogs = [...new Set([...currentDogs, ...dogs])];
    
    // Update the user document with the merged dogs array
    await userRef.update({ dogs: updatedDogs });

    res.json({ message: 'User dogs array updated successfully' });
  } catch (err) {
    console.error('Failed to update user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Endpoint to fetch users
app.get('/api/users', async (req, res) => {
  try {
    const usersCollection = db.collection('users');
    const usersSnapshot = await usersCollection.get();

    const usersData = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(usersData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});