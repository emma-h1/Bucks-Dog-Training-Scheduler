import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Modal, Alert, ListGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pencil, Trash, Plus } from "react-bootstrap-icons";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDogsModal, setShowDogsModal] = useState(false);
  const [showDogFormModal, setShowDogFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDogs, setUserDogs] = useState([]);
  const [editingDog, setEditingDog] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    dogs: []
  });

  const [dogFormData, setDogFormData] = useState({
    name: '',
    age: '',
    breed: '',
    weight: '',
    additionalInfo: '',
    ownerID: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:4999/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
      setTimeout(() => setError(null), 3000);
    }
  };

  const fetchUserDogs = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:4999/api/dogs?ownerID=${userId}`);
      setUserDogs(response.data);
    } catch (err) {
      setError('Failed to fetch user dogs');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        email: user.email || '',
        dogs: user.dogs || []
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        dogs: []
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      dogs: []
    });
  };

  const handleShowDogsModal = async (userId) => {
    setSelectedUserId(userId);
    await fetchUserDogs(userId);
    setShowDogsModal(true);
  };

  const handleCloseDogsModal = () => {
    setShowDogsModal(false);
    setUserDogs([]);
    setSelectedUserId(null);
  };

  const handleShowDogFormModal = (dog = null) => {
    // Always use the selectedUserId, which is the ID of the user we're managing dogs for
    if (dog) {
      setEditingDog(dog);
      setDogFormData({
        name: dog.name || '',
        age: dog.age || '',
        breed: dog.breed || '',
        weight: dog.weight || '',
        additionalInfo: dog.additionalInfo || '',
        ownerID: selectedUserId
      });
    } else {
      setEditingDog(null);
      setDogFormData({
        name: '',
        age: '',
        breed: '',
        weight: '',
        additionalInfo: '',
        ownerID: selectedUserId
      });
    }
    setShowDogFormModal(true);
  };

  const handleCloseDogFormModal = () => {
    setShowDogFormModal(false);
    setEditingDog(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDogInputChange = (e) => {
    const { name, value } = e.target;
    setDogFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`http://localhost:4999/api/users/${editingUser.id}`, formData);
        setSuccess('User updated successfully');
      } else {
        await axios.post('http://localhost:4999/api/users', formData);
        setSuccess('User added successfully');
      }
      handleCloseModal();
      fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save user');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDogSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedDogData = {
        ...dogFormData,
        ownerID: selectedUserId
      };

      if (editingDog) {
        await axios.put(`http://localhost:4999/api/dogs/${editingDog.id}`, updatedDogData);
        setSuccess('Dog updated successfully');
      } else {
        const response = await axios.post('http://localhost:4999/api/dogs', updatedDogData);
        const dogId = response.data.id;
        
        // Add the dog ID to the user's dogs array
        await axios.patch(`http://localhost:4999/api/users/${selectedUserId}`, {
          dogs: [dogId]
        });
        setSuccess('Dog added successfully');
      }
      handleCloseDogFormModal();
      // Refresh the dogs list for the selected user
      fetchUserDogs(selectedUserId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to ${editingDog ? 'update' : 'add'} dog`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:4999/api/users/${id}`);
        setSuccess('User deleted successfully');
        fetchUsers();
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Failed to delete user');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleDeleteDog = async (dogId) => {
    if (window.confirm('Are you sure you want to delete this dog?')) {
      try {
        await axios.delete(`http://localhost:4999/api/dogs/${dogId}`);
        
        await axios.delete(`http://localhost:4999/api/users/${selectedUserId}/dogs/${dogId}`);
        
        setSuccess('Dog deleted successfully');
        // Refresh the dogs list
        fetchUserDogs(selectedUserId);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('Failed to delete dog');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  return (
    <Container className="py-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Users</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={20} /> Add New User
        </Button>
      </div>

      {/* Error and Success Messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* User Grid */}
      <Row xs={1} className="g-0">
        {users.map((user) => (
          <Col key={user.id}>
            <div className="d-flex justify-content-between align-items-center p-3 bg-white border shadow-sm mb-2">
              <div>
                <strong>{user.firstName} {user.lastName}</strong>
                <div>{user.username}</div>
                <div>{user.email}</div>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-info"
                  size="sm"
                  onClick={() => handleShowDogsModal(user.id)}
                >
                   Manage Dogs
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleShowModal(user)}
                >
                  <Pencil /> Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                >
                  <Trash /> Delete
                </Button>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingUser ? 'Save Changes' : 'Add User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Manage Dogs Modal */}
      <Modal show={showDogsModal} onHide={handleCloseDogsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Manage Dogs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between mb-3">
            <h5>Dogs List</h5>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => handleShowDogFormModal()}
            >
              <Plus size={16} /> Add New Dog
            </Button>
          </div>

          {userDogs.length === 0 ? (
            <p className="text-muted">No dogs found for this user.</p>
          ) : (
            <ListGroup>
              {userDogs.map(dog => (
                <ListGroup.Item 
                  key={dog.id} 
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="m-2">
                    <div><strong>{dog.name}</strong> ({dog.breed})</div>
                    <div className="text-muted">Age: {dog.age}, Weight: {dog.weight}</div>
                    {dog.additionalInfo && <div className="text-muted small">{dog.additionalInfo}</div>}
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleShowDogFormModal(dog)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteDog(dog.id)}
                    >
                      <Trash /> Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDogsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Dog Modal */}
      <Modal show={showDogFormModal} onHide={handleCloseDogFormModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingDog ? 'Edit Dog' : 'Add New Dog'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDogSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={dogFormData.name}
                onChange={handleDogInputChange}
                placeholder="Enter dog's name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Age</Form.Label>
              <Form.Control
                type="text"
                name="age"
                value={dogFormData.age}
                onChange={handleDogInputChange}
                placeholder="Enter dog's age"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Breed</Form.Label>
              <Form.Control
                type="text"
                name="breed"
                value={dogFormData.breed}
                onChange={handleDogInputChange}
                placeholder="Enter dog's breed"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="text"
                name="weight"
                value={dogFormData.weight}
                onChange={handleDogInputChange}
                placeholder="Enter dog's weight (lb)"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Info</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="additionalInfo"
                value={dogFormData.additionalInfo}
                onChange={handleDogInputChange}
                placeholder="Enter any additional information"
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseDogFormModal}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={!dogFormData.name || !dogFormData.age || !dogFormData.breed || !dogFormData.weight}
              >
                {editingDog ? 'Save Changes' : 'Add Dog'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageUsers;