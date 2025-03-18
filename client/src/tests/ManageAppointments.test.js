
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ManageAppointments from '../pages/ManageAppointments'; // Adjust the import path as needed
import { Container, Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  }));

describe('ManageAppointments Component', () => {
  const mockAppointments = [
    {
      id: 1,
      dog: 'Rex',
      owner: 'John Doe',
      trainer: 'Jane Smith',
      date: '2025-03-01',
      location: 'Main Facility',
      dropoffTime: '9:00 AM',
      pickupTime: '5:00 PM',
      purpose: 'Training',
      balanceDue: '$150'
    },
    {
      id: 2,
      dog: 'Bella',
      owner: 'Sarah Johnson',
      trainer: 'Mike Brown',
      date: '2025-03-02',
      location: 'Park',
      dropoffTime: '10:00 AM',
      pickupTime: '4:00 PM',
      purpose: 'Socialization',
      balanceDue: '$100'
    }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock successful GET request
    axios.get.mockResolvedValue({ data: mockAppointments });
    
    // Mock window.confirm to always return true
    global.window.confirm = jest.fn(() => true);
  });

  test('renders manage appointments page with header', async () => {
    render(<ManageAppointments />);
    
    // Check if header is rendered
    expect(screen.getByText('Manage Appointments')).toBeInTheDocument();
    expect(screen.getByText('Add New Appointment')).toBeInTheDocument();
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
    });
  });

  test('displays appointments correctly', async () => {
    render(<ManageAppointments />);
    
    // Wait for appointments to be displayed
    await waitFor(() => {
      expect(screen.getByText('Rex | John Doe')).toBeInTheDocument();
      expect(screen.getByText(/Trainer: Jane Smith/)).toBeInTheDocument();
      expect(screen.getByText('Bella | Sarah Johnson')).toBeInTheDocument();
      expect(screen.getByText(/Purpose: Socialization/)).toBeInTheDocument();
    });
  });

  test('opens add appointment modal when add button is clicked', async () => {
    render(<ManageAppointments />);
    
    // Click the add button
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Check if modal is opened with correct title
    expect(screen.getByText('Add New Appointment')).toBeInTheDocument();
    expect(screen.getByLabelText('Dog Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Owner Name')).toBeInTheDocument();
    
    // Check if form fields are empty
    expect(screen.getByLabelText('Dog Name')).toHaveValue('');
    expect(screen.getByLabelText('Owner Name')).toHaveValue('');
  });

  test('opens edit appointment modal with appointment data', async () => {
    render(<ManageAppointments />);
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByText('Rex | John Doe')).toBeInTheDocument();
    });
    
    // Find and click the first Edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if modal is opened with correct title and data
    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    
    // Verify form fields are filled with appointment data
    expect(screen.getByLabelText('Dog Name')).toHaveValue('Rex');
    expect(screen.getByLabelText('Owner Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Trainer')).toHaveValue('Jane Smith');
    expect(screen.getByLabelText('Date')).toHaveValue('2025-03-01');
  });

  test('submits new appointment correctly', async () => {
    // Mock successful POST request
    axios.post.mockResolvedValue({ data: { id: 3, ...mockAppointments[0] } });
    
    render(<ManageAppointments />);
    
    // Click add button
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Dog Name'), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText('Owner Name'), { target: { value: 'Alex Green' } });
    fireEvent.change(screen.getByLabelText('Trainer'), { target: { value: 'Tom Wilson' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2025-03-10' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Home' } });
    fireEvent.change(screen.getByLabelText('Dropoff Time'), { target: { value: '8:00 AM' } });
    fireEvent.change(screen.getByLabelText('Pickup Time'), { target: { value: '3:00 PM' } });
    fireEvent.change(screen.getByLabelText('Purpose'), { target: { value: 'Behavior Training' } });
    fireEvent.change(screen.getByLabelText('Balance Due'), { target: { value: '$200' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Add Appointment'));
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:4999/api/appointments', {
        dog: 'Max',
        owner: 'Alex Green',
        trainer: 'Tom Wilson',
        date: '2025-03-10',
        location: 'Home',
        dropoffTime: '8:00 AM',
        pickupTime: '3:00 PM',
        purpose: 'Behavior Training',
        balanceDue: '$200'
      });
      expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + after add
    });
  });

  test('edits appointment correctly', async () => {
    // Mock successful PUT request
    axios.put.mockResolvedValue({ data: { ...mockAppointments[0], dog: 'Updated Rex' } });
    
    render(<ManageAppointments />);
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByText('Rex | John Doe')).toBeInTheDocument();
    });
    
    // Find and click the first Edit button
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update form field
    fireEvent.change(screen.getByLabelText('Dog Name'), { target: { value: 'Updated Rex' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify API call
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('http://localhost:4999/api/appointments/1', {
        dog: 'Updated Rex',
        owner: 'John Doe',
        trainer: 'Jane Smith',
        date: '2025-03-01',
        location: 'Main Facility',
        dropoffTime: '9:00 AM',
        pickupTime: '5:00 PM',
        purpose: 'Training',
        balanceDue: '$150'
      });
      expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + after edit
    });
  });

  test('deletes appointment correctly', async () => {
    // Mock successful DELETE request
    axios.delete.mockResolvedValue({ data: {} });
    
    render(<ManageAppointments />);
    
    // Wait for appointments to load
    await waitFor(() => {
      expect(screen.getByText('Rex | John Doe')).toBeInTheDocument();
    });
    
    // Find and click the first Delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify confirmation dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this appointment?');
    
    // Verify API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/appointments/1');
      expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + after delete
    });
  });

  test('handles API errors gracefully', async () => {
    // Mock failed GET request
    axios.get.mockRejectedValueOnce(new Error('API error'));
    
    render(<ManageAppointments />);
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch appointments')).toBeInTheDocument();
    });
  });

  test('handles form submission errors gracefully', async () => {
    // Mock failed POST request
    axios.post.mockRejectedValueOnce(new Error('API error'));
    
    render(<ManageAppointments />);
    
    // Click add button
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Fill out form (minimal requirements)
    fireEvent.change(screen.getByLabelText('Dog Name'), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText('Owner Name'), { target: { value: 'Alex Green' } });
    fireEvent.change(screen.getByLabelText('Trainer'), { target: { value: 'Tom Wilson' } });
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2025-03-10' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Home' } });
    fireEvent.change(screen.getByLabelText('Dropoff Time'), { target: { value: '8:00 AM' } });
    fireEvent.change(screen.getByLabelText('Pickup Time'), { target: { value: '3:00 PM' } });
    fireEvent.change(screen.getByLabelText('Purpose'), { target: { value: 'Behavior Training' } });
    fireEvent.change(screen.getByLabelText('Balance Due'), { target: { value: '$200' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Add Appointment'));
    
    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('Failed to save appointment')).toBeInTheDocument();
    });
  });

  test('closes modal when cancel button is clicked', async () => {
    render(<ManageAppointments />);
    
    // Click add button
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Verify modal is open
    expect(screen.getByText('Add New Appointment')).toBeInTheDocument();
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });
  });
});
