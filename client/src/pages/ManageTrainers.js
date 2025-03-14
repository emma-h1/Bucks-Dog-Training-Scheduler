import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pencil, Trash, Plus } from "react-bootstrap-icons";

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    bio: ''
  });

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await axios.get('http://localhost:4999/api/trainers');
      setTrainers(response.data);
    } catch (err) {
      setError('Failed to fetch Trainers');
    }
  };

  const handleShowModal = (trainer = null) => {
    if (trainer) {
      setEditingTrainer(trainer);
      setFormData({
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        username: trainer.username,
        email: trainer.email,
        bio: trainer.bio
      });
    } else {
      setEditingTrainer(null);
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        bio: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTrainer(null);
    setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        bio: ''
     });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrainer) {
        await axios.put(`http://localhost:4999/api/trainers/${editingTrainer.id}`, formData);
      } else {
        await axios.post('http://localhost:4999/api/trainers', formData);
      }
      handleCloseModal();
      fetchTrainers();
    } catch (err) {
      setError('Failed to save Trainer');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Trainer?')) {
      try {
        await axios.delete(`http://localhost:4999/api/trainers/${id}`);
        fetchTrainers();
      } catch (err) {
        setError('Failed to delete Trainer');
      }
    }
  };


  return (
    <div>
    <Container className="py-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Trainers</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={20} /> Add New Trainer
        </Button>
      </div>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Trainer Grid */}
      <Row xs={1} className="g-0">
        {trainers.map((trainer) => (
        <Col key={trainer.id}>
        <div className="d-flex justify-content-between align-items-center p-3 bg-white border shadow-sm">
            <div>
                <h3>{trainer.firstName} {trainer.lastName}</h3>
                <div>{trainer.username} | {trainer.email}</div>
                <div>Biography: {trainer.bio}</div>
            </div>
            <div className="d-flex gap-2">
            <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleShowModal(trainer)}
            >
            <Pencil /> Edit
            </Button>
            <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(trainer.id)}
            >
                <Trash /> Delete
          </Button>
            </div>
         </div>
        </Col>
        ))}
    </Row>

    </Container>

        {/* Add/Edit Trainer Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="textarea"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                as="textarea"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                as="textarea"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                as="textarea"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bio</Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingTrainer ? 'Save Changes' : 'Add Trainer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>

  );
};

export default ManageTrainers;