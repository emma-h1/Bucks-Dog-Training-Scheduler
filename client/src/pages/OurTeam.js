import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const OurTeam = () => {
  const [trainers, setTrainers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await axios.get('http://localhost:4999/api/trainers');
        console.log('waiting for trainers');
        setTrainers(response.data);
      } catch (err) {
        setError('Failed to fetch trainers');
      }
    };

    fetchTrainers();
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
        <h1 className="mb-4 fw-bold">Our Team</h1>
        {/* Employee Grid */}
      <Row xs={1} className="g-4">
        {trainers.map((trainer) => (
          <Col key={trainer.id} className="mx-auto" style={{ maxWidth: '800px'}}>
            <div className="h-100 d-flex flex-column justify-content-center p-3 bg-white border shadow-sm rounded">
                <h2>{trainer.firstName} {trainer.lastName}</h2>
                <div style={{ overflow: 'hidden'}}>
                    <p>
                        {trainer.bio}
                    </p>
                </div>

            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default OurTeam;