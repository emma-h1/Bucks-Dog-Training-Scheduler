import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import ManageAppointments from '../pages/ManageAppointments';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Mock data
const mockDogs = [
  { id: 'dog1', name: 'Rex', ownerID: 'owner1' },
  { id: 'dog2', name: 'Buddy', ownerID: 'owner2' }
];

const mockOwners = [
  { id: 'owner1', firstName: 'John', lastName: 'Doe' },
  { id: 'owner2', firstName: 'Jane', lastName: 'Smith' }
];

const mockTrainers = [
  { id: 'trainer1', firstName: 'Toby', lastName: 'Johnson' },
  { id: 'trainer2', firstName: 'Sarah', lastName: 'Hills' }
];

const mockAppointments = [
  {
    id: 'appt1',
    dog: 'dog1',
    owner: 'owner1',
    trainer: 'trainer1',
    startTime: '2025-03-20T10:00:00.000Z',
    endTime: '2025-03-20T11:00:00.000Z',
    location: 'Main Office',
    purpose: 'Basic Training',
    balanceDue: '$50'
  },
  {
    id: 'appt2',
    dog: 'dog2',
    owner: 'owner2',
    trainer: 'trainer2',
    startTime: '2025-03-21T14:00:00.000Z',
    endTime: '2025-03-21T15:00:00.000Z',
    location: 'Park',
    purpose: 'Socialization',
    balanceDue: '$75'
  }
];

describe('ManageAppointments Component', () => {
  beforeEach(() => {
    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/appointments')) {
        return Promise.resolve({ data: mockAppointments });
      } else if (url.includes('/api/dogs')) {
        return Promise.resolve({ data: mockDogs });
      } else if (url.includes('/api/users')) {
        return Promise.resolve({ data: mockOwners });
      } else if (url.includes('/api/trainers')) {
        return Promise.resolve({ data: mockTrainers });
      }
      return Promise.reject(new Error('Not found'));
    });

    axios.post.mockResolvedValue({ data: { id: 'new-appt' } });
    axios.put.mockResolvedValue({ data: { success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the component and fetches data', async () => {
    render(<ManageAppointments />);
    
    // Check heading
    expect(screen.getByText('Manage Appointments')).toBeInTheDocument();
    
    // Check if Add New Appointment button is rendered
    expect(screen.getByText('Add New Appointment')).toBeInTheDocument();
    
    // Wait for the appointments to be loaded
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/dogs');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/users');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/trainers');
    });

  });

  test('opens the modal when Add New Appointment button is clicked', async () => {
    render(<ManageAppointments />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
    
    // Click on Add New Appointment button
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Check if modal is opened
    expect(screen.getByText('Select a dog')).toBeInTheDocument();
    expect(screen.getByText('Select a trainer')).toBeInTheDocument();
  });

  test('opens the edit modal when Edit button is clicked', async () => {
    render(<ManageAppointments />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
    
    // Find and click the Edit button for the first appointment
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if modal is opened with edit title
    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    
    // Check if form is pre-filled
    await waitFor(() => {
      const locationInput = screen.getByLabelText('Location');
      expect(locationInput.value).toBe('Main Office');
      
      const purposeInput = screen.getByLabelText('Purpose');
      expect(purposeInput.value).toBe('Basic Training');
    });
  });

  test('submits new appointment correctly', async () => {
    render(<ManageAppointments />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
    
    // Open add appointment modal
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Fill the form
    const dogSelect = screen.getByLabelText('Dog');
    fireEvent.change(dogSelect, { target: { value: 'dog1' } });
    
    const trainerSelect = screen.getByLabelText('Trainer');
    fireEvent.change(trainerSelect, { target: { value: 'trainer1' } });
    
    const startTimeInput = screen.getByLabelText('Start Time');
    fireEvent.change(startTimeInput, { target: { value: '2025-04-01T10:00' } });
    
    const endTimeInput = screen.getByLabelText('End Time');
    fireEvent.change(endTimeInput, { target: { value: '2025-04-01T11:00' } });
    
    const locationInput = screen.getByLabelText('Location');
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    
    const purposeInput = screen.getByLabelText('Purpose');
    fireEvent.change(purposeInput, { target: { value: 'Test Purpose' } });
    
    const balanceDueInput = screen.getByLabelText('Balance Due');
    fireEvent.change(balanceDueInput, { target: { value: '$100' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Appointment'));
    
    // Verify the API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:4999/api/appointments', {
        dog: 'dog1',
        owner: 'owner1',
        trainer: 'trainer1',
        startTime: '2025-04-01T10:00',
        endTime: '2025-04-01T11:00',
        location: 'Test Location',
        purpose: 'Test Purpose',
        balanceDue: '$100'
      });
    });
    
    // Check if appointments are reloaded
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
  });

  test('edits an appointment correctly', async () => {
    render(<ManageAppointments />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
    
    // Find and click the Edit button for the first appointment
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Edit location field
    const locationInput = screen.getByLabelText('Location');
    fireEvent.change(locationInput, { target: { value: 'Updated Location' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify the API call
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('http://localhost:4999/api/appointments/appt1', expect.objectContaining({
        location: 'Updated Location'
      }));
    });
    
    // Check if appointments are reloaded
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
  });

  test('deletes an appointment correctly', async () => {
    window.confirm = jest.fn().mockImplementation(() => true);
    
    render(<ManageAppointments />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
    
    // Find and click the Delete button for the first appointment
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation was requested
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this appointment?');
    
    // Verify the API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/appointments/appt1');
    });
    
    // Check if appointments are reloaded
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
  });

  test('handles API errors correctly', async () => {
    // Mock API errors
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/appointments')) {
        return Promise.reject(new Error('API error'));
      }
      return Promise.resolve({ data: [] });
    });
    
    render(<ManageAppointments />);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch appointments')).toBeInTheDocument();
    });
  });

  test('auto-selects owner when dog is selected', async () => {
    render(<ManageAppointments />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(4);
    });
    
    // Open add appointment modal
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Select a dog
    const dogSelect = screen.getByLabelText('Dog');
    fireEvent.change(dogSelect, { target: { value: 'dog1' } });
    
    // Fill other required fields
    const trainerSelect = screen.getByLabelText('Trainer');
    fireEvent.change(trainerSelect, { target: { value: 'trainer1' } });
    
    const startTimeInput = screen.getByLabelText('Start Time');
    fireEvent.change(startTimeInput, { target: { value: '2025-04-01T10:00' } });
    
    const endTimeInput = screen.getByLabelText('End Time');
    fireEvent.change(endTimeInput, { target: { value: '2025-04-01T11:00' } });
    
    const locationInput = screen.getByLabelText('Location');
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    
    const purposeInput = screen.getByLabelText('Purpose');
    fireEvent.change(purposeInput, { target: { value: 'Test Purpose' } });
    
    const balanceDueInput = screen.getByLabelText('Balance Due');
    fireEvent.change(balanceDueInput, { target: { value: '$100' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Appointment'));
    
    // Verify owner was auto-selected based on dog selection
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:4999/api/appointments', 
        expect.objectContaining({
          dog: 'dog1',
          owner: 'owner1'
        })
      );
    });
  });

  test('displays an error message when fetching data fails', async () => {
    axios.get.mockRejectedValue(new Error('Error'));
    render(<ManageAppointments />);

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch document lists')).toBeInTheDocument();
    });
  });
  
  test('displays error when fetching appointments fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch appointments'));
    render(<ManageAppointments />);
      
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch appointments')).toBeInTheDocument();
    });
  });
  
  test('displays error when saving appointment fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to save appointment'));
    render(<ManageAppointments />);
      
    fireEvent.click(screen.getByText('Add New Appointment'));
    fireEvent.change(screen.getByLabelText('Dog'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Trainer'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '2023-10-01T10:00' } });
    fireEvent.change(screen.getByLabelText('End Time'), { target: { value: '2023-10-01T11:00' } });
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'Park' } });
    fireEvent.change(screen.getByLabelText('Purpose'), { target: { value: 'Training' } });
    fireEvent.change(screen.getByLabelText('Balance Due'), { target: { value: '100' } });
      
    fireEvent.click(screen.getByText('Add Appointment'));
      
    await waitFor(() => {
      expect(screen.getByText('Failed to save appointment')).toBeInTheDocument();
    });
  });
  
  test('displays error when deleting appointment fails', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, dog: '1', owner: '1', trainer: '1', startTime: '2023-10-01T10:00', endTime: '2023-10-01T11:00' }] });
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete appointment'));
    render(<ManageAppointments />);
      
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete'));
    });
      
    await waitFor(() => {
      expect(screen.getByText('Failed to delete appointment')).toBeInTheDocument();
    });
  });
});