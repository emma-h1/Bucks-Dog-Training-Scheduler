import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Modal, Alert, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pencil, Trash, Plus, Upload } from "react-bootstrap-icons";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CreateTrainer from "./CreateTrainer.js";

const ManageTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    bio: '',
    imgURL: ''
  });

  const [showCreateTrainer, setShowCreateTrainer] = useState(false);

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
        bio: trainer.bio,
        imgURL: trainer.imgURL || ''
      });
      setImagePreview(trainer.imgURL || null);
    } else {
      setEditingTrainer(null);
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        bio: '',
        imgURL: ''
      });
      setImagePreview(null);
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
      bio: '',
      imgURL: ''
    });
    setImagePreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      // Get Firebase storage reference
      const storage = getStorage();
      const storageRef = ref(storage, `trainer-images/${new Date().getTime()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update form data with the image URL
      setFormData(prev => ({
        ...prev,
        imgURL: downloadURL
      }));
      
      setUploading(false);
    } catch (err) {
      setError('Failed to upload image');
      setUploading(false);
    }
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

  const handleOpenCreateTrainer = () => {
    setShowCreateTrainer(true);
  }

  const handleCloseCreateTrainer = () => {
    setShowCreateTrainer(false);
  }

  const handleCreatedTrainer = () => {
    fetchTrainers(); // Refresh to include new trainer
  }

  return (
    <div>
    <Container className="py-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Trainers</h1>
        <Button variant="primary" onClick={() => handleOpenCreateTrainer()}>
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
            <div className="d-flex align-items-center">
              {trainer.imgURL && (
                <Image 
                  src={trainer.imgURL} 
                  roundedCircle 
                  width={64} 
                  height={64} 
                  className="me-3" 
                  alt={`${trainer.firstName} ${trainer.lastName}`} 
                />
              )}
              <div>
                <h3>{trainer.firstName} {trainer.lastName}</h3>
                <div>{trainer.username} | {trainer.email}</div>
                <div>Biography: {trainer.bio}</div>
              </div>
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
        {/* Add/Edit Trainer Modal NO LONGER USED TO ADD*/}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="firstName">First Name</Form.Label>
              <Form.Control
                type="textarea"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="lastName">Last Name</Form.Label>
              <Form.Control
                as="textarea"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="username">Username</Form.Label>
              <Form.Control
                as="textarea"
                name="username"
                id="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="email">Email</Form.Label>
              <Form.Control
                as="textarea"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="bio">Bio</Form.Label>
              <Form.Control
                as="textarea"
                name="bio"
                id="bio"
                value={formData.bio}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            {/* Image Upload Field */}
            <Form.Group className="mb-3">
              <Form.Label>Profile Image</Form.Label>
              <div className="d-flex flex-column align-items-center">
                {imagePreview && (
                  <Image 
                    src={imagePreview} 
                    alt="Image preview" 
                    thumbnail 
                    className="mb-2" 
                    style={{ maxHeight: '150px' }} 
                  />
                )}
                <div className="d-flex align-items-center w-100">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="w-100"
                  >
                    <Upload className="me-2" />
                    {uploading ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                </div>
              </div>
            </Form.Group>
            
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={uploading}>
                {editingTrainer ? 'Save Changes' : 'Add Trainer'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Add Trainer Modal*/}
      <CreateTrainer 
      show={showCreateTrainer} 
      onHide={handleCloseCreateTrainer} 
      onCreate={handleCreatedTrainer} />

    </div>
  );
};

export default ManageTrainers;