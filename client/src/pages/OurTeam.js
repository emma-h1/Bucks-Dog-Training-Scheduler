import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
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
      <h1 className="page-header text-center mb-5">Meet Our Team</h1>
      
      {/* Employee Grid */}
      <Row xs={1} className="g-4">
        {trainers.map((trainer) => (
          <Col key={trainer.id} className="mx-auto" style={{ maxWidth: '1200px' }}>
            <div className="h-100 p-4 bg-white border shadow-sm rounded">
              <div className="d-flex flex-column flex-md-row">
                {/* Image Container */}
                <div className="me-md-4 mb-3 mb-md-0 text-center">
                  {trainer.imgURL ? (
                    <img
                      src={trainer.imgURL}
                      alt={`${trainer.firstName} ${trainer.lastName}`}
                      style={{
                        width: '300px',
                        maxheight: '400px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div 
                      style={{
                        width: '300px',
                        height: '400px',
                        borderRadius: '12px',
                        backgroundColor: '#e9ecef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span className="text-muted">No Image</span>
                    </div>
                  )}
                </div>
                
                {/* Content Container */}
                <div className="flex-grow-1">
                  <h2 className="mb-4">{trainer.firstName} {trainer.lastName}</h2>
                  <div style={{ overflow: 'hidden', textAlign: 'left' }}>
                    <p style={{ whiteSpace: 'pre-line', fontSize: '1.25rem'}}>
                      {trainer.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default OurTeam;