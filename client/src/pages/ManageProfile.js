import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pencil, Plus, Save, ChevronRight, ChevronDown, Trash } from "react-bootstrap-icons";
import { auth } from '../firebase';

const ManageProfile = () => {
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    dogs: []
  });
  const [editField, setEditField] = useState({
    email: false,
    username: false,
    firstName: false,
    lastName: false
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDogModal, setShowDogModal] = useState(false);
  const [isEditingDog, setIsEditingDog] = useState(false);
  const [currentDog, setCurrentDog] = useState({
    id: '',
    name: '',
    age: '',
    breed: '',
    weight: '',
    additionalInfo: '',
    ownerID: auth.currentUser?.uid // Automatically set to the current user's ID
  });

  // Fetch user profile and dogs on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfileAndDogs();
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch profile and then dogs in sequence to prevent race conditions
  const fetchProfileAndDogs = async () => {
    try {
      await fetchProfileData();
      await fetchDogs();
    } catch (err) {
      setError('Failed to load user data');
    }
  };

  // Fetch user profile data
  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`http://localhost:4999/api/users/${auth.currentUser.uid}`);
      setProfile(prev => ({
        ...response.data,
        dogs: prev.dogs // Keep the existing dogs array
      }));
      return response.data;
    } catch (err) {
      setError('Failed to load profile data');
      throw err;
    }
  };

  // Fetch dogs specific to the current user
  const fetchDogs = async () => {
    try {
      const response = await axios.get(`http://localhost:4999/api/dogs?ownerID=${auth.currentUser.uid}`);
      setProfile(prev => ({
        ...prev,
        dogs: response.data // Update the dogs array with the fetched dogs
      }));
      return response.data;
    } catch (err) {
      setError('Failed to load dogs');
    }
  };

  // Toggle edit mode for a specific field
  const toggleEdit = (field) => {
    setEditField(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle input changes for profile form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle input changes for the dog form
  const handleDogInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentDog(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setError(null);
      const { dogs, ...profileWithoutDogs } = profile;
      await axios.put(`http://localhost:4999/api/users/${auth.currentUser.uid}`, profileWithoutDogs);
      setSuccess('Profile updated successfully');

      // Reset all edit modes
      setEditField({
        email: false,
        username: false,
        firstName: false,
        lastName: false
      });
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  // Open dog modal for adding a new dog
  const handleShowAddDogModal = () => {
    setIsEditingDog(false);
    setCurrentDog({
      id: '',
      name: '',
      age: '',
      breed: '',
      weight: '',
      additionalInfo: '',
      ownerID: auth.currentUser?.uid || '' // Set ownerID to the current user's ID
    });
    setShowDogModal(true);
  };

  // Open dog modal for editing an existing dog
  const handleShowEditDogModal = (dog) => {
    setIsEditingDog(true);
    setCurrentDog({
      id: dog.id,
      name: dog.name,
      age: dog.age,
      breed: dog.breed,
      weight: dog.weight,
      additionalInfo: dog.additionalInfo || '',
      ownerID: dog.ownerID
    });
    setShowDogModal(true);
  };

  // Close dog modal
  const handleCloseDogModal = () => {
    setShowDogModal(false);
  };

  // Save dog (add new or update existing)
  const handleSaveDog = async () => {
    try {
      if (isEditingDog) {
        // Update existing dog
        await axios.put(`http://localhost:4999/api/dogs/${currentDog.id}`, currentDog);
        setSuccess('Dog updated successfully');
      } else {
        // Add new dog
        const response = await axios.post('http://localhost:4999/api/dogs', currentDog);
        const dogId = response.data.id; // Get the dog ID from the response

        // Add the dog ID to the user's dogs array
        await axios.patch(`http://localhost:4999/api/users/${auth.currentUser.uid}`, {
          dogs: [dogId] // Add the new dog ID to the user's dogs array
        });
        setSuccess('Dog added successfully');
      }
      
      fetchDogs(); // Refresh the list of dogs
      handleCloseDogModal();
    } catch (err) {
      setError(`Failed to ${isEditingDog ? 'update' : 'add'} dog`);
    }
  };

  // Remove a dog from the user's profile
  const handleRemoveDog = async (dogID) => {
    try {
      await axios.delete(`http://localhost:4999/api/dogs/${dogID}`);
      await axios.delete(`http://localhost:4999/api/users/${auth.currentUser.uid}/dogs/${dogID}`);
      setSuccess('Dog removed successfully');
      fetchDogs(); // Refresh the list of dogs
    } catch (err) {
      setError('Failed to remove dog');
    }
  };

  // Render field with arrow/chevron to toggle edit mode
  const renderField = (field, label) => {
    return (
      <div className="mb-3 border rounded p-3">
        <div 
          className="d-flex justify-content-between align-items-center mb-1 cursor-pointer"
          onClick={() => toggleEdit(field)}
        >
          <div className="fw-bold">{label}</div>
          <div>
            {editField[field] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>
        
        <div>
          {!editField[field] ? (
            <div>{profile[field] || <span className="text-muted">Not set</span>}</div>
          ) : (
            <div>
              <Form.Control
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={profile[field]}
                onChange={handleInputChange}
                className="mt-2"
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
              <Button variant="success" size="sm" onClick={handleSaveProfile} className="mt-3">
                <Save size={16} className="me-2 align-center" /> Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Profile</h1>
      </div>

      {/* Alerts */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        {/* Profile Information */}
        <Col md={8}>
          <Card className="shadow-sm mb-4">
            <Card.Header as="h5">Profile Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={12} className="text-align-center">
                  {renderField('email', 'Email')}
                  {renderField('username', 'Username')}
                  {renderField('firstName', 'First Name')}
                  {renderField('lastName', 'Last Name')}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Dogs Section */}
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Dogs</h5>
              <Button variant="primary" size="sm" onClick={handleShowAddDogModal}>
                <Plus size={16} /> Add Dog
              </Button>
            </Card.Header>
            <Card.Body>
              {profile.dogs.length === 0 ? (
                <p className="text-muted">No dogs added yet</p>
              ) : (
                <ul className="list-group">
                  {profile.dogs.map(dog => (
                    <li key={dog.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {dog.name}
                      <div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="m-1"
                          onClick={() => handleShowEditDogModal(dog)}
                        >
                          <Pencil /> Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleRemoveDog(dog.id)}
                        >
                          <Trash /> Remove
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Dog Modal (Add/Edit) */}
      <Modal show={showDogModal} onHide={handleCloseDogModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditingDog ? 'Edit Dog' : 'Add Dog'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={currentDog.name}
                onChange={handleDogInputChange}
                placeholder="Enter dog's name"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="text"
                name="age"
                value={currentDog.age}
                onChange={handleDogInputChange}
                placeholder="Enter dog's age"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Breed</Form.Label>
              <Form.Control
                type="text"
                name="breed"
                value={currentDog.breed}
                onChange={handleDogInputChange}
                placeholder="Enter dog's breed"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="text"
                name="weight"
                value={currentDog.weight}
                onChange={handleDogInputChange}
                placeholder="Enter dog's weight (lb)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Info</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="additionalInfo"
                value={currentDog.additionalInfo}
                onChange={handleDogInputChange}
                placeholder="Enter any additional information"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDogModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveDog}
            disabled={!currentDog.name || !currentDog.age || !currentDog.breed || !currentDog.weight}
          >
            {isEditingDog ? 'Save Changes' : 'Add Dog'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageProfile;