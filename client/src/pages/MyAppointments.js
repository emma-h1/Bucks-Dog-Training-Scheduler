import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Alert, Tab, Tabs, Badge, Form, Dropdown, InputGroup } from 'react-bootstrap';
import { FileEarmarkText, Search } from "react-bootstrap-icons";
import Calendar from "./SelfCalendar"
import { auth } from "../firebase"

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [trainingReports, setTrainingReports] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);

  const [availableDogs, setAvailableDogs] = useState([]);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [availableTrainers, setAvailableTrainers] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchAppointments();
        fetchTrainingReports();
        fetchDocuments();
      } else {
        setError('no user');
      }
    });
    
    return () => unsubscribe();
  }, []);

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
      const response = await axios.get(`http://localhost:4999/api/appointments?owner=${auth.currentUser.uid}`);
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

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Appointments</h1>
      </div>

      <div className="mb-4 w-50">
        <Dropdown show={showDropdown} onToggle={(isOpen) => {if (!isOpen || searchTerm !== '') {setShowDropdown(isOpen)}}}>
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
                  className="d-flex justify-content-between align-items-center"
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
                  </div>
                </Col>
              ))
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
                    ? `No past appointments found for ${searchTerm}.`
                    : 'No past appointments found.'}
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
                            {report && <Badge bg="success" className="ms-2">Report Available</Badge>}
                            {!report && <Badge bg="secondary" className="ms-2">No Report Yet</Badge>}
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
                      </div>
                      
                      {report ? (
                        <div className="mt-3 p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0"><FileEarmarkText className="me-2" />Training Report</h6>
                          </div>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{report.reportText}</div>
                        </div>
                      ) : (
                        <h6>. . .</h6>
                      )}
                    </div>
                  </Col>
                );
              })
            )}
          </Row>
        </Tab>
      </Tabs>

    </Container>
  );
};

export default MyAppointments;