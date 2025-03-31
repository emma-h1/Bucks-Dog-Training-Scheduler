const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const { getFirestore } = require("firebase-admin/firestore");
const nodemailer = require('nodemailer');
const cron = require('node-cron');

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

// Users register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { uid, firstName, lastName, username, email } = req.body;


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
//Trainer Register
app.post("/api/auth/registerTrainer", async (req, res) => {
  try {
    const { uid, firstName, lastName, username, email} = req.body;

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

// Helper function to parse Firebase timestamps
const parseFirebaseTimestamp = (timestamp) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate(); // Convert Firebase Timestamp to JavaScript Date
  }
  return null;
};

// Helper function to format date for Firebase
const formatDateForFirebase = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString); // Convert ISO string to JavaScript Date
};

// Endpoint to get appintments (all or by ownerID)
app.get('/api/appointments', async (req, res) => {
  const owner = req.query.owner; // Get ownerID from query parameter (optional)

  try {
    // Query Firestore for appts
    const apptRef = db.collection('appointments');
    let querySnapshot;

    if (owner) {
      // If ownerID is provided, filter appt by owner
      querySnapshot = await apptRef.where('owner', '==', owner).get();
    } else {
      // If no ownerID, get all appts
      querySnapshot = await apptRef.get();
    }

    const appointments = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      appointments.push({
        id: doc.id,
        dog: data.dog,
        owner: data.owner,
        trainer: data.trainer,
        startTime: parseFirebaseTimestamp(data.startTime), // Convert Firebase Timestamp to Date
        endTime: parseFirebaseTimestamp(data.endTime), // Convert Firebase Timestamp to Date
        location: data.location,
        purpose: data.purpose,
        balanceDue: data.balanceDue
      });
    });

    res.json(appointments); // Return the appts
  } catch (err) {
    console.error('Failed to fetch appts:', err);
    res.status(500).json({ error: 'Failed to fetch appts' });
  }
});

// POST a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { dog, owner, trainer, startTime, endTime, location, purpose, balanceDue } = req.body;

    const newAppointment = {
      dog,
      owner,
      trainer,
      startTime: formatDateForFirebase(startTime), // Convert ISO string to Date
      endTime: formatDateForFirebase(endTime), // Convert ISO string to Date
      location,
      purpose,
      balanceDue
    };

    const docRef = await db.collection('appointments').add(newAppointment);

    // Fetch owner's email from the database
    const ownerDoc = await db.collection('users').doc(owner).get();
    if (!ownerDoc.exists) {
      throw new Error('Owner not found');
    }
    const ownerEmail = ownerDoc.data().email;
    
    // Fetch dog's name from the databse
    const dogDoc = await db.collection('dogs').doc(dog).get();
    if (!dogDoc.exists) {
      throw new Error('Dog not found');
    }
    const dogName = dogDoc.data().name;

    // Send email confirmation
    await sendEmailConfirmation(ownerEmail, {
      dogName: dogName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      purpose
    });
    res.status(201).json({ id: docRef.id, ...newAppointment });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// PUT (update) an existing appointment
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dog, owner, trainer, startTime, endTime, location, purpose, balanceDue } = req.body;

    const updatedAppointment = {
      dog,
      owner,
      trainer,
      startTime: formatDateForFirebase(startTime), // Convert ISO string to Date
      endTime: formatDateForFirebase(endTime), // Convert ISO string to Date
      location,
      purpose,
      balanceDue
    };

    await db.collection('appointments').doc(id).update(updatedAppointment);
    res.status(200).json({ id, ...updatedAppointment });
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

// Endpoint to get dogs (all or by ownerID)
app.get('/api/dogs', async (req, res) => {
  const ownerID = req.query.ownerID; // Get ownerID from query parameter (optional)

  try {
    // Query Firestore for dogs
    const dogsRef = db.collection('dogs');
    let querySnapshot;
    
    if (ownerID) {
      // If ownerID is provided, filter dogs by owner
      querySnapshot = await dogsRef.where('ownerID', '==', ownerID).get();
    } else {
      // If no ownerID, get all dogs
      querySnapshot = await dogsRef.get();
    }

    const dogs = [];
    querySnapshot.forEach((doc) => {
      dogs.push({ id: doc.id, ...doc.data() }); // Include document ID and data
    });

    res.json(dogs); // Return the dogs
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

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'christa.kohler76@ethereal.email',
      pass: 'xX199MdYcUaHdEUB8w'
  }
});

const sendEmail = async (to, subject, html) => {
  const mailInfo = {
    from: '"Bucks Dog Training" <christa.kohler76@ethereal.email>',
    to,
    subject,
    html
  }

  transporter.sendMail(mailInfo, (err, info) => {
    if (err) {
        console.log('Error occurred. ' + err.message);
        return process.exit(1);
    }

    console.log('Message sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}

const sendEmailConfirmation = async (ownerEmail, appointmentDetails) => {
  const { dogName, startTime, endTime, location, purpose } = appointmentDetails;

  const html = `
    <h1>Appointment Confirmation</h1>
    <p>Your appointment for ${dogName} has been successfully scheduled.</p>
    <ul>
      <li><strong>Start Time:</strong> ${startTime.toLocaleString()}</li>
      <li><strong>End Time:</strong> ${endTime.toLocaleString()}</li>
      <li><strong>Location:</strong> ${location}</li>
      <li><strong>Purpose:</strong> ${purpose}</li>
    </ul>
    <p>Thank you for choosing our service!</p>
  `;

  await sendEmail(ownerEmail, 'Appointment Confirmation', html);
};

const sendEmailReminder = async (ownerEmail, appointmentDetails) => {
  const { dogName, startTime, endTime, location, purpose } = appointmentDetails;

  const html = `
    <h1>Appointment Reminder</h1>
    <p>This is a reminder for ${dogName}'s appointment today.</p>
    <ul>
      <li><strong>Start Time:</strong> ${startTime.toLocaleString()}</li>
      <li><strong>End Time:</strong> ${endTime.toLocaleString()}</li>
      <li><strong>Location:</strong> ${location}</li>
      <li><strong>Purpose:</strong> ${purpose}</li>
    </ul>
    <p>We look forward to seeing you!</p>
  `;

  await sendEmail(ownerEmail, 'Appointment Reminder', html);
};

processReminders = async () => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  const appointmentsSnapshot = await db.collection('appointments')
    .where('startTime', '>=', startOfDay)
    .where('startTime', '<=', endOfDay)
    .get();

  const todaysAppointments = [];
  appointmentsSnapshot.forEach((doc) => {
    const data = doc.data();
    todaysAppointments.push({
      id: doc.id,
      dog: data.dog,
      owner: data.owner,
      trainer: data.trainer,
      startTime: parseFirebaseTimestamp(data.startTime), // Convert Firebase Timestamp to Date
      endTime: parseFirebaseTimestamp(data.endTime), // Convert Firebase Timestamp to Date
      location: data.location,
      purpose: data.purpose,
      balanceDue: data.balanceDue
    });
  });

  if (todaysAppointments.length > 0) {
      // Send reminder emails for each appointment
      for (const appointment of todaysAppointments) {
        // Fetch owner's email from the database
      const ownerDoc = await db.collection('users').doc(appointment.owner).get();
      if (!ownerDoc.exists) {
        throw new Error('Owner not found');
      }
      const ownerEmail = ownerDoc.data().email;
      
      // Fetch dog's name from the databse
      const dogDoc = await db.collection('dogs').doc(appointment.dog).get();
      if (!dogDoc.exists) {
        throw new Error('Dog not found');
      }
      const dogName = dogDoc.data().name;

      await sendEmailReminder(ownerEmail, {
        dogName,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        location: appointment.location,
        purpose: appointment.purpose
      });
    }
  }
}

cron.schedule("0 8 * * *", processReminders);

// processReminders();

// Endpoint to fetch training reports
app.get('/api/trainingReports', async (req, res) => {
  try {
    const reportCollection = db.collection('trainingReports');
    const reportSnapshot = await reportCollection.get();

    const reportData = reportSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(reportData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// create report
app.post('/api/trainingReports', async (req, res) => {
  try {
    const { appointment, reportText } = req.body;
    const newReport = await db.collection('trainingReports').add({
      appointment, reportText
    });
    res.status(201).json({ id: newReport.id });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report' });
  }
});

// Update a report
app.put('/api/trainingReports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { appointment, reportText } = req.body;
    
    await db.collection('trainingReports').doc(id).update({
      appointment, reportText
    });
    
    res.json({ message: 'report updated successfully' });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete a report
app.delete('/api/trainingReports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('trainingReports').doc(id).delete();
    res.json({ message: 'report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});