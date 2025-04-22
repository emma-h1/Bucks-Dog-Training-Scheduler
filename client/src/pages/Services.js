import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('http://localhost:4999/api/ServiceLibrary');
        console.log('waiting for services');
        setServices(response.data);
      } catch (err) {
        setError('Failed to fetch services');
      }
    };

    fetchServices();
  }, []);

  if (error) {
    return (
      <div className="text-center text-danger p-4">
        {error}
      </div>
    );
  }

  return (

    <Container className="mb-4">
        <h1 className="page-header">Our Services</h1>
        {/* Services Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {services.map((service) => (
          <Col key={service.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title className="fw-bold">{service.name}</Card.Title>
                <Card.Text className="text-muted">{service.description}</Card.Text>
                <Card.Text className="text-primary">{service.price}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ServicesPage;