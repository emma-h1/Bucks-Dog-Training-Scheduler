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
    startTime: '',
    endTime: '',
    location: '',
    purpose: '',
    balanceDue: ''
  });

  const [availableDogs, setAvailableDogs] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [availableTrainers, setAvailableTrainers] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const dogsResponse = await axios.get('http://localhost:4999/api/dogs');
      setAvailableDogs(dogsResponse.data);

      const ownersResponse = await axios.get('http://localhost:4999/api/users');
      setAvailableOwners(ownersResponse.data);

      const trainersResponse = await axios.get('http://localhost:4999/api/trainers');
      setAvailableTrainers(trainersResponse.data);
    } catch (err) {
      setError('Failed to fetch document lists');
    }
  };

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
        startTime: formatDateTimeForInput(appointment.startTime),
        endTime: formatDateTimeForInput(appointment.endTime),
        location: appointment.location || '',
        purpose: appointment.purpose || '',
        balanceDue: appointment.balanceDue || ''
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        dog: '',
        owner: '',
        trainer: '',
        startTime: '',
        endTime: '',
        location: '',
        purpose: '',
        balanceDue: ''
      });
    }
    setShowModal(true);
  };

  const formatDateTimeForInput = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', timestamp);
        return '';
      }
      
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAppointment(null);
    setFormData({
      dog: '',
      owner: '',
      trainer: '',
      startTime: '',
      endTime: '',
      location: '',
      purpose: '',
      balanceDue: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dog') {
      const selectedDog = availableDogs.find(dog => dog.id === value);
      setFormData(prev => ({
        ...prev,
        dog: value,
        owner: selectedDog ? selectedDog.ownerID : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Not set';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', timestamp);
        return 'Invalid date';
      }
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid date';
    }
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

  const getDogName = (dogID) => {
    const dog = availableDogs.find(d => d.id === dogID);
    return dog ? dog.name : dogID;
  };

  const getOwnerName = (ownerID) => {
    const owner = availableOwners.find(owner => owner.id === ownerID);
    return owner ? `${owner.firstName} ${owner.lastName}` : ownerID;
  };

  const getTrainerName = (trainerID) => {
    const trainer = availableTrainers.find(trainer => trainer.id === trainerID);
    return trainer ? `${trainer.firstName} ${trainer.lastName}` : trainerID;
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Appointments</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={20} /> Add New Appointment
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row xs={1} className="g-0">
        {appointments.length === 0 ? (
          <Col>
            <Alert variant="info">No appointments found.</Alert>
          </Col>
        ) : (
          appointments.map((appointment) => (
            <Col key={appointment.id} className="mb-3">
              <div className="d-flex justify-content-between align-items-center p-3 bg-white border shadow-sm">
                <div>
                  <h5 className="mb-1 fw-bold">
                    {getDogName(appointment.dog)} &emsp; | &emsp;
                    {getOwnerName(appointment.owner)}
                  </h5>
                  <p className="text-muted mb-1">
                    <strong>Start:</strong> {formatTimestamp(appointment.startTime)} &emsp;| &emsp;
                    <strong>End:</strong> {formatTimestamp(appointment.endTime)} &emsp;| &emsp;
                    <strong>Trainer:</strong> {getTrainerName(appointment.trainer)}
                  </p>
                  <p className="text-muted mb-1">
                    <strong>Location:</strong> {appointment.location || 'N/A'} &emsp;| &emsp;
                    <strong>Balance Due:</strong> {appointment.balanceDue || '$0'}
                  </p>
                  <p className="text-muted mb-1"><strong>Purpose:</strong> {appointment.purpose || 'N/A'}</p>
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
          ))
        )}
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingAppointment ? 'Edit Appointment' : 'Add New Appointment'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="dog">Dog</Form.Label>
              <Form.Select
                name="dog"
                value={formData.dog}
                onChange={handleInputChange}
                id="dog"
                required
              >
                <option>Select a dog</option>
                {availableDogs.map(dog => {
                  const owner = availableOwners.find(owner => owner.id === dog.ownerID);
                  const ownerLastName = owner ? owner.lastName : 'Unknown Owner';

                  return (
                    <option key={dog.id} value={dog.id}>
                      {dog.name} ({ownerLastName})
                    </option>
                  );
                })}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="trainer">Trainer</Form.Label>
              <Form.Select
                name="trainer"
                id="trainer"
                value={formData.trainer}
                onChange={handleInputChange}
                required
              >
                <option>Select a trainer</option>
                {availableTrainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.firstName && trainer.lastName ? `${trainer.firstName} ${trainer.lastName}` : trainer.id}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="startTime">Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="startTime"
                id="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="endTime">End Time</Form.Label>
              <Form.Control
                type="datetime-local"
                name="endTime"
                id="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="location">Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="purpose">Purpose</Form.Label>
              <Form.Control
                as="textarea"
                name="purpose"
                id="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="balanceDue">Balance Due</Form.Label>
              <Form.Control
                type="text"
                name="balanceDue"
                id="balanceDue"
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