import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, Card } from "react-bootstrap";
import axios from "axios";

const ManageGallery = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  // Fetch Images from Server
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get("http://localhost:4999/api/gallery");
        setImages(response.data.map((image) => ({
          id: image.id, 
          url: image.imageUrl,
        })));
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    };
    fetchImages();
  }, []);
  

  // Upload Image
  const handleUpload = async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append("image", file);
  
    try {
      const response = await axios.post("http://localhost:4999/api/gallery/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      
      const { id, imageUrl } = response.data;
      setImages([...images, { id, url: imageUrl }]);
      setFile(null);
      alert("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Delete Image
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4999/api/gallery/${id}`);
      setImages(images.filter((image) => image.id !== id));
      alert("Image deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <Container className="py-4">
      <h1>Manage Gallery</h1>

      {/* Upload Form */}
      <Form className="mb-4">
        <Form.Group controlId="formFile">
          <Form.Label>Select Image to Upload</Form.Label>
          <Form.Control type="file" onChange={(e) => setFile(e.target.files[0])} />
        </Form.Group>
        <Button variant="primary" className="mt-2" onClick={handleUpload}>
          Upload Image
        </Button>
      </Form>

      {/* Gallery Display */}
      <Row xs={1} md={3} lg={4} className="g-4">
        {images.map(({ id, url }) => (
          <Col key={id}>
            <Card className="h-100 shadow-sm">
              <Card.Img variant="top" src={url} />
              <Card.Body className="text-center">
                <Button variant="danger" onClick={() => handleDelete(id)}>
                  Delete
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default ManageGallery;
