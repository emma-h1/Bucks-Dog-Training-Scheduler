import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Form, Modal, Alert, Tab, Tabs, Badge, Dropdown, InputGroup} from 'react-bootstrap';
import { Pencil, Trash, Plus, FileEarmarkText, Search } from "react-bootstrap-icons";
import Calendar from "./AllCalendar"

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [trainingReports, setTrainingReports] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
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

  const [reportFormData, setReportFormData] = useState({
    appointment: '',
    reportText: '',
  });

  const [availableDogs, setAvailableDogs] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [availableTrainers, setAvailableTrainers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);

  useEffect(() => {
    fetchAppointments();
    fetchTrainingReports();
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

  const fetchTrainingReports = async () => {
    try {
      const response = await axios.get('http://localhost:4999/api/trainingReports');
      setTrainingReports(response.data);
    } catch (err) {
      setError('Failed to fetch training reports');
    }
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredAppointments([]);
      setShowDropdown(false);
      setSelectedDog(null); // Clear selected dog when search is cleared
      return;
    }

    const uniqueDogIds = [...new Set(appointments.map(app => app.dog))];
    const matchingDogs = availableDogs.filter(dog => 
      dog.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      uniqueDogIds.includes(dog.id)
    );

    if (matchingDogs.length > 0) {
      setFilteredAppointments(matchingDogs);
      setShowDropdown(true);
    } else {
      setFilteredAppointments([]);
      setShowDropdown(false);
    }
  }, [searchTerm, availableDogs, appointments]);


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      setShowDropdown(false);
      setSelectedDog(null); // Clear selected dog when search is cleared
    } else {
      setShowDropdown(true);
    }
  };

  const handleDogSelect = (dogID) => {
    setSearchTerm(getDogName(dogID));
    setSelectedDog(dogID); // Set the selected dog ID
    setShowDropdown(false);
  };

  const getFilteredAppointmentsByDog = (appointmentsList) => {
    if (!searchTerm) return appointmentsList;
    return appointmentsList.filter(app => {
      const dogName = getDogName(app.dog);
      return dogName.toLowerCase().includes(searchTerm.toLowerCase());
    });
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

  const handleShowReportModal = (appointment = null, report = null) => {
    if (report) {
      setEditingReport(report);
      setReportFormData({
        appointment: report.appointment,
        reportText: report.reportText,
      });
    } else if (appointment) {
      setEditingReport(null);
      setReportFormData({
        appointment: appointment.id,
        reportText: '',
      });
    } else {
      return;
    }
    setShowReportModal(true);
  };

  const formatDateTimeForInput = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
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

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setEditingReport(null);
    setReportFormData({
      appointment: '',
      reportText: '',
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

  const handleReportInputChange = (e) => {
    const { name, value } = e.target;
    setReportFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Not set';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
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
      window.location.reload();
    } catch (err) {
      setError('Failed to save appointment');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReport) {
        await axios.put(`http://localhost:4999/api/trainingReports/${editingReport.id}`, reportFormData);
      } else {
        await axios.post('http://localhost:4999/api/trainingReports', reportFormData);
      }
      handleCloseReportModal();
      fetchTrainingReports();
    } catch (err) {
      setError('Failed to save training report');
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

  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this training report?')) {
      try {
        await axios.delete(`http://localhost:4999/api/trainingReports/${id}`);
        fetchTrainingReports();
      } catch (err) {
        setError('Failed to delete training report');
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

  const isAppointmentPast = (appointment) => {
    if (!appointment || !appointment.endTime) return false;
    const now = new Date();
    const endTime = new Date(appointment.endTime);
    return endTime < now;
  };

  const isAppointmentToday = (appointment) => {
    if (!appointment || !appointment.startTime || !appointment.endTime) return false;
    
    const now = new Date();
    const today = new Date();
    today.setHours(24,24,24,24);
    const endTime = new Date(appointment.endTime);
    const startTime = new Date(appointment.startTime);
    return endTime > now && startTime <= today;
    
  };

  const getReportForAppointment = (appointment) => {
    return trainingReports.find(report => report.appointment === appointment);
  };


  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Manage Appointments</h1>
      </div>

      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Dropdown show={showDropdown} onToggle={(isOpen) => {if (!isOpen || searchTerm !== '') {setShowDropdown(isOpen)}}} className="w-50">
          <Dropdown.Toggle as={InputGroup} className="p-0" style={{ border: 'none' }}>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by dog name"
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={() => searchTerm !== '' && setShowDropdown(true)}
              />
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setShowDropdown(false);
                    setSelectedDog(null); // Clear selected dog when search is cleared
                  }}
                >
                  ×
                </button>
              )}
            </InputGroup>
          </Dropdown.Toggle>

          <Dropdown.Menu className="w-100 shadow-sm">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map(dog => (
                <Dropdown.Item 
                  key={dog.id} 
                  onClick={() => handleDogSelect(dog.id)}
                  className="d-flex"
                >
                  {dog.name}
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item disabled>
                No matches found
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>

        <Button variant="primary" onClick={() => handleShowModal()}>
          <Plus size={20} /> Add New Appointment
        </Button>
      </div>

      {/* Pass the selected dog ID to the Calendar component */}
      <Calendar selectedDog={selectedDog} />

      {error && <Alert variant="danger">{error}</Alert>}


      <Tabs defaultActiveKey="today" id="appointment-tabs">
      <Tab eventKey="today" title="Today's Appointments">
          <Row xs={1} className="g-0">
            {getFilteredAppointmentsByDog(appointments.filter(app => isAppointmentToday(app))).length === 0 ? (
              <Col>
                <Alert variant="info">
                  {searchTerm !== '' 
                    ? `No appointments found for ${searchTerm} today.`
                    : 'No appointments scheduled for today.'}
                </Alert>
              </Col>
            ) : (
              getFilteredAppointmentsByDog(appointments.filter(app => isAppointmentToday(app)))
              .sort((a,b) => new Date(a.startTime) - new Date(b.startTime))
              .map((appointment) => {
                const report = getReportForAppointment(appointment.id);
                return (
                  <Col key={appointment.id}>
                    <div className="p-3 bg-white border shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3">
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
                      
                      {report ? (
                        <div className="mt-3 p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0"><FileEarmarkText className="me-2" />Training Report</h6>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleShowReportModal(appointment, report)}
                              >
                                <Pencil /> Edit Report
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteReport(report.id)}
                              >
                                <Trash /> Delete Report
                              </Button>
                            </div>
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{report.reportText}</div>
                        </div>
                      ) : (
                        <div className="d-flex mt-3">
                          <Button 
                            variant="outline-secondary"
                            data-testid="addReport"
                            onClick={() => handleShowReportModal(appointment)}
                          >
                            <Plus className="me-1" /> Add Training Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })
            )}
          </Row>
        </Tab>
        <Tab eventKey="upcoming" title="Upcoming Appointments">
          <Row xs={1} className="g-0">
            {getFilteredAppointmentsByDog(appointments.filter(app => !isAppointmentPast(app) && !isAppointmentToday(app))).length === 0 ? (
              <Col>
                <Alert variant="info">
                  {searchTerm !== '' 
                    ? `No upcoming appointments found for ${searchTerm}.`
                    : 'No upcoming appointments found.'}
                </Alert>
              </Col>
            ) : (
              getFilteredAppointmentsByDog(appointments.filter(app => !isAppointmentPast(app) && !isAppointmentToday(app)))
              .sort((a,b) => new Date(a.startTime) - new Date(b.startTime))
              .map((appointment) => (
                <Col key={appointment.id}>
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
        </Tab>
        <Tab eventKey="past" title="Past Appointments">
          <Row xs={1} className="g-0">
            {getFilteredAppointmentsByDog(appointments.filter(app => isAppointmentPast(app))).length === 0 ? (
              <Col>
                <Alert variant="info">
                  {searchTerm !== '' 
                    ? `No upcoming appointments found for ${searchTerm}.`
                    : 'No upcoming appointments found.'}
                </Alert>
              </Col>
            ) : (
              getFilteredAppointmentsByDog(appointments.filter(app => isAppointmentPast(app)))
              .sort((a,b) => new Date(b.startTime) - new Date(a.startTime))
              .map((appointment) => {
                const report = getReportForAppointment(appointment.id);
                return (
                  <Col key={appointment.id}>
                    <div className="p-3 bg-white border shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <h5 className="mb-1 fw-bold">
                            {getDogName(appointment.dog)} &emsp; | &emsp;
                            {getOwnerName(appointment.owner)}
                            {report && <Badge bg="success" className="ms-2">Has Report</Badge>}
                            {!report && <Badge bg="secondary" className="ms-2">Needs a Report</Badge>}
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
                      
                      {report ? (
                        <div className="mt-3 p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0"><FileEarmarkText className="me-2" />Training Report</h6>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleShowReportModal(appointment, report)}
                              >
                                <Pencil /> Edit Report
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteReport(report.id)}
                              >
                                <Trash /> Delete Report
                              </Button>
                            </div>
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{report.reportText}</div>
                        </div>
                      ) : (
                        <div className="d-flex mt-3">
                          <Button 
                            variant="outline-secondary"
                            data-testid="addReport"
                            onClick={() => handleShowReportModal(appointment)}
                          >
                            <Plus className="me-1" /> Add Training Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })
            )}
          </Row>
        </Tab>
      </Tabs>

      {/* Appointment Modal */}
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

      {/* Training Report Modal */}
      <Modal show={showReportModal} onHide={handleCloseReportModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingReport ? 'Edit Training Report' : 'Add Training Report'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleReportSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="reportText">Training Report</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                name="reportText"
                id="reportText"
                value={reportFormData.reportText}
                onChange={handleReportInputChange}
                placeholder="Enter training details, progress notes, and recommendations..."
                required
              />
            </Form.Group>
            <div className="d-flex gap-2 justify-content-end">
              <Button variant="secondary" onClick={handleCloseReportModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingReport ? 'Save Changes' : 'Add Report'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ManageAppointments;