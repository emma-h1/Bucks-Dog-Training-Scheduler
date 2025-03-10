import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Pencil, Trash, Plus } from "react-bootstrap-icons";

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    dog: '',
    owner: '',
    trainer: '',
    date: '',
    location: '',
    dropoffTime: '',
    pickupTime: '',
    purpose: '',
    balanceDue: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('http://localhost:4999/api/appointments');
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to fetch appointments');
    }
  };

  const handleShowModal = (appointment = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        dog: appointment.dog,
        owner: appointment.owner,
        trainer: appointment.trainer,
        date: appointment.date,
        location: appointment.location,
        dropoffTime: appointment.dropoffTime,
        pickupTime: appointment.pickupTime,
        purpose: appointment.purpose,
        balanceDue: appointment.balanceDue
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        dog: '',
        owner: '',
        trainer: '',
        date: '',
        location: '',
        dropoffTime: '',
        pickupTime: '',
        purpose: '',
        balanceDue: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setFormData({
        dog: '',
        owner: '',
        trainer: '',
        date: '',
        location: '',
        dropoffTime: '',
        pickupTime: '',
        purpose: '',
        balanceDue: ''
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
      if (editingAppointment) {
        await axios.put(`http://localhost:4999/api/appointments/${editingAppointment.id}`, formData);
      } else {
        await axios.post('http://localhost:4999/api/appointments', formData);
      }
      handleCloseModal();
      fetchAppointments();
    } catch (err) {
      setError('Failed to save appointment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await axios.delete(`http://localhost:4999/api/appointments/${id}`);
        fetchAppointments();
      } catch (err) {
        setError('Failed to delete appointment');
      }
    }
  };


  return (
    <Container className="py-4">
      {/* Header with Add Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Appointments</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={20} /> Add New Appointment
        </Button>
      </div>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Appointment Grid */}
      <Row xs={1} className="g-0">
        {appointments.map((appointment) => (
        <Col key={appointment.id}>
        <div className="d-flex justify-content-between align-items-center p-3 bg-white border shadow-sm">
            <div>
            <h5 className="mb-1 fw-bold">{appointment.dog} &emsp; | &emsp; {appointment.owner} </h5>
            <p className="text-muted mb-1">
                Date: {appointment.date}  &emsp;| &emsp;   Trainer: {appointment.trainer}  &emsp; |  &emsp; 
                Location: {appointment.location}   &emsp; | &emsp;   Dropoff Time: {appointment.dropoffTime}    &emsp; | &emsp;  
                Pickup Time: {appointment.pickupTime}    &emsp; | &emsp;   Balance Due: {appointment.balanceDue}
            </p>
            <p className="text-muted mb-1">Purpose: {appointment.purpose}</p>
            </div>
            <div className="d-flex gap-2">
            <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleShowModal(appointment)}
            >
            <Pencil /> Edit
            </Button>
            <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDelete(appointment.id)}
            >
                <Trash /> Delete
          </Button>
        </div>
      </div>
    </Col>
  ))}
</Row>

      {/* Add/Edit Service Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Dog Name</Form.Label>
              <Form.Control
                type="textarea"
                name="dog"
                value={formData.dog}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Owner Name</Form.Label>
              <Form.Control
                as="textarea"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trainer</Form.Label>
              <Form.Control
                as="textarea"
                name="trainer"
                value={formData.trainer}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                as="textarea"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Control
                as="textarea"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dropoff Time</Form.Label>
              <Form.Control
                as="textarea"
                name="dropoffTime"
                value={formData.dropoffTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Pickup Time</Form.Label>
              <Form.Control
                as="textarea"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Purpose</Form.Label>
              <Form.Control
                as="textarea"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Balance Due</Form.Label>
              <Form.Control
                as="textarea"
                name="balanceDue"
                value={formData.balanceDue}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingAppointment ? 'Save Changes' : 'Add Appointment'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>

  );
};

export default ManageAppointments;