import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import bg from "../assets/dogRunning.png";
import "./Home.css";
import cgc from "../assets/cgc.png";
import usadt from "../assets/usadt.png";
import catchImg from "../assets/catch.png";
import lauraine from "../assets/lauraine.png";

const bgStyle = {
  backgroundImage: `url(${bg})`,
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  width: '100vw',
  height: '101vh',
};

export default function Home() {
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    // Fetch gallery images
    /*
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:4999/api/gallery");
        setGalleryImages(response.data.map((image) => ({
          id: image.id, 
          url: image.imageUrl,
        })));
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };
    
    fetchImages(); */
  }, []);

  return (
    <div>
      <div style={bgStyle}>
        <div className="header">
          Unleash Your Dog's Potential
        </div>

        <div className="text">
          At Buck's Dog Training of Central NJ, we're not just dog trainers. We're dog lovers, just like you,
          and we believe in the transformative power of a balanced approach to dog training.
        </div>
      </div>

      {/* Why Us Section */}
      <Container className="py-5 mt-5">
        <h2 className="text-center why-us">Why Choose Buck's Dog Training</h2>
        <h6 className="text-center why-us-par">We go beyond the standard dog training methods. Our balanced approach respects your dog's inherent nature while nurturing
          them to adapt to human expectations. This not only leads to a well-behaved pet but also ensures the retention of their training in the long term.
        </h6>
        <h3 className="text-center why-us-par2">
          Ready to embark on a transformative journey with your furry friend? Connect with us today.
        </h3>
      </Container>

      <div className="your-expert-guide mt-4">
        <img
          src={lauraine}
          alt={`lauraine`}
          style={{
            width: '400px',
            height: '400px',
            borderRadius: '12px',
            objectFit: 'cover',
            marginTop: '100px',
            marginLeft: '40px'
          }}
        />
        <div>
        <h2 className="text-center why-us">Your Expert Guide: Lauraine Wright</h2>
        <h6 className="text-center why-us-par">Meet Lauraine Wright, your personal guide on this journey.</h6>
        <h6 className="text-center why-us-par">
          An alumnus of the esteemed CATCH Canine Trainers Academy, Lauraine's lifelong passion for dogs has led her through various experiences—rescue, foster, kennel work, and training.
        </h6>
        <h6 className="text-center why-us-par">
          Lauraine isn't just a trainer; she's a partner, committed to helping you and your dog achieve your full potential. Remember, as Lauraine says, "Invest your time and effort.
          Your reward is a stronger bond with your dog. Give your furry friend the structure, guidance, and support they deserve."
        </h6>
        </div>
      </div>

      {/* Gallery Section */}
      <Container className="gallery-section py-5 bg-light">
        <h2 className="text-center mb-4">Our Happy Clients</h2>
        {/*
        <Row xs={1} md={3} lg={4} className="g-4">
          {galleryImages.map(({ id, url }) => (
            <Col key={id}>
              <Card className="shadow-sm">
                <Card.Img variant="top" src={url} alt="gallery img" />
              </Card>
            </Col>
          ))}
        </Row> */}
      </Container>
      <div className="org">
        <img src={cgc} alt="cgc" height={120} />
        <img src={usadt} alt="usadt" height={120} />
        <img src={catchImg} alt="catch" height={120} />
      </div>
    </div>
  );
}