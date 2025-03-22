import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Form, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pencil, Trash, Plus } from "react-bootstrap-icons";

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:4999/api/ServiceLibrary');
      setServices(response.data);
    } catch (err) {
      setError('Failed to fetch services');
    }
  };

  const handleShowModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        price: service.price
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '' });
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
      if (editingService) {
        await axios.put(`http://localhost:4999/api/ServiceLibrary/${editingService.id}`, formData);
      } else {
        await axios.post('http://localhost:4999/api/ServiceLibrary', formData);
      }
      handleCloseModal();
      fetchServices();
    } catch (err) {
      setError('Failed to save service');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`http://localhost:4999/api/ServiceLibrary/${id}`);
        fetchServices();
      } catch (err) {
        setError('Failed to delete service');
      }
    }
  };


  return (
    <Container className="py-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Services</h1>
        <Button variant="primary" className="addService" onClick={() => handleShowModal()}>
          <Plus size={20} /> Add New Service
        </Button>
      </div>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Services Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {services.map((service) => (
          <Col key={service.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="fw-bold">{service.name}</Card.Title>
                <Card.Text className="text-muted">{service.description}</Card.Text>
                <Card.Text className="text-primary">{service.price}</Card.Text>
                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleShowModal(service)}
                  >
                    <Pencil /> Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash /> Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add/Edit Service Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingService ? 'Edit Service' : 'Add New Service'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="serviceName">Service Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                id="serviceName"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="description">Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="price">Price</Form.Label>
              <Form.Control
                as="textarea"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingService ? 'Save Changes' : 'Add Service'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>

  );
};

export default ManageServices;