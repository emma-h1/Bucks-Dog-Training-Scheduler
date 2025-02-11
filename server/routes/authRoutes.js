const express = require("express");
const { db } = require("../firebase");
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { uid, firstName, lastName, email } = req.body;

    // Store user data in Firestore
    await db.collection("users").doc(uid).set({
      firstName,
      lastName,
      email,
      createdAt: new Date(),
    });

    res.status(201).send({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).send({ error: "Failed to save user data" });
  }
});

module.exports = router;
