import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Spinner } from 'react-bootstrap';
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

    <Container className="py-4">
        <h1 className="mb-4">Our Services</h1>
        <ul className="list-unstyled">
        {services.map((service) => (
            <li key={service.id} className="mb-4">
            <h3>{service.name}</h3>
            <p className="text-muted">{service.description}</p>
            <p className="fw-bold text-primary fs-5">
                {service.price}
            </p>
            </li>
        ))}
        </ul>
    </Container>
  );
};

export default ServicesPage;