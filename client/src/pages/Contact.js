import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Telephone, Envelope } from 'react-bootstrap-icons';

const Contact = () => {
  return (
    <Container>
        <h1 className="page-header">Contact Us</h1>

      <Row className="g-4 mb-5">
      <Col md={6}>
          <div className="contact-text">
                <p className="mb-4">Ready to take the first step towards a more rewarding relationship with your dog? We'd love to hear from you.</p>
                <p className="mb-4">At Buck's Dog Training of Central NJ, we're here to answer your questions, discuss your specific needs, and guide you through our training programs.</p>
                Whether you're a new dog owner looking for guidance, or an experienced handler seeking advanced training, our dedicated team is here to provide the support you need.
                Reach out to us today, and let's work together to bring out the best in your furry friend.
          </div>
        </Col>
        
        <Col md={6}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="p-4">
              <h2 className="mb-4">Contact Information</h2>
              <div className="d-flex flex-column ps-4 text-muted">
                    <span className="mb-4">
                        <Telephone size={24} className="me-2" />
                        (609) 527-3223
                    </span>
                    <span>
                        <Envelope size={24} className="me-2" />
                        Lauraine@bucksdogtraining.com
                    </span>
                </div>
                <Row className="mt-5">
                    <Col className="text-left">
                    <h3>Hours of Operation</h3>
                    <div className="d-flex mt-3">
                        <table className="table table-borderless" style={{ maxWidth: '400px' }}>
                        <tbody>
                            <tr>
                            <td className="fw-bold">Sunday - Friday</td>
                            <td>9:00 AM - 5:00 PM</td>
                            </tr>
                            <tr>
                            <td className="fw-bold">Saturday</td>
                            <td>10:00 AM - 5:00 PM</td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    </Col>
                </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;