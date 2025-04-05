import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import axios from 'axios';
import ManageAppointments from '../pages/ManageAppointments';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../pages/AllCalendar', () => ({ selectedDog }) => <div data-testid="calendar-component" data-selected-dog={selectedDog} />);

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
    startTime: '2025-03-01T10:00:00',
    endTime: '2025-03-01T11:00:00',
    location: 'Main Office',
    purpose: 'Basic Training',
    balanceDue: '$50'
  },
  {
    id: 'appt2',
    dog: 'dog2',
    owner: 'owner2',
    trainer: 'trainer2',
    startTime: '2025-04-01T10:00:00',
    endTime: '2025-04-01T11:00:00',
    location: 'Park',
    purpose: 'Socialization',
    balanceDue: '$75'
  },

  {
    id: 'appt3',
    dog: 'dog2',
    owner: 'owner2',
    trainer: 'trainer2',
    startTime: '2025-07-01T10:00:00',
    endTime: '2025-07-01T11:00:00',
    location: 'Building',
    purpose: 'Boarding',
    balanceDue: '$75'
  },

  {
    id: 'appt4',
    dog: 'dog2',
    owner: 'owner2',
    trainer: 'trainer2',
    startTime: '2026-07-01T10:00:00',
    endTime: '2026-07-01T11:00:00',
    location: 'Building',
    purpose: 'Boarding',
    balanceDue: '$75'
  }
];

const mockTrainingReports = [
  {
    id: 'report1',
    appointment: 'appt1',
    reportText: 'The dog performed well during the session.'
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
      } else if (url.includes('/api/trainingReports')) {
        return Promise.resolve({data: mockTrainingReports })
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
    await act(async () => {
      render(<ManageAppointments />);
    });
    
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
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(5);
    });
    
    // Click on Add New Appointment button
    fireEvent.click(screen.getByText('Add New Appointment'));
    
    // Check if modal is opened
    expect(screen.getByText('Select a dog')).toBeInTheDocument();
    expect(screen.getByText('Select a trainer')).toBeInTheDocument();
  });

  test('opens the edit modal when Edit button is clicked', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(5);
    });
    
    // Find and click the Edit button for the first appointment
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if modal is opened with edit title
    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    
    // Check if form is pre-filled
    await waitFor(() => {
      const locationInput = screen.getByLabelText('Location');
      expect(locationInput.value).toBe('Building');
      
      const purposeInput = screen.getByLabelText('Purpose');
      expect(purposeInput.value).toBe('Boarding');
    });
  });

  test('submits new appointment correctly', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(5);
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
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Wait for data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(5);
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
      expect(axios.put).toHaveBeenCalledWith('http://localhost:4999/api/appointments/appt3', expect.objectContaining({
        location: 'Updated Location'
      }));
    });
    
    // Check if appointments are reloaded
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
  });

  test('deletes an appointment correctly', async () => {
    window.confirm = jest.fn().mockImplementation(() => true);
    
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(5);
    });
    
    // Find and click the Delete button for the first appointment
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation was requested
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this appointment?');
    
    // Verify the API call
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/appointments/appt3');
    });
    
    // Check if appointments are reloaded
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
  });

  test('auto-selects owner when dog is selected', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(5);
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
    await act(async () => {
      render(<ManageAppointments />);
    });

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch document lists')).toBeInTheDocument();
    });
  });
  
  test('displays error when fetching appointments fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch appointments'));
    await act(async () => {
      render(<ManageAppointments />);
    });
      
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch appointments')).toBeInTheDocument();
    });
  });
  
  test('displays error when saving appointment fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to save appointment'));
    await act(async () => {
      render(<ManageAppointments />);
    });
      
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
    axios.delete.mockRejectedValueOnce(new Error('API Error'));
    window.confirm = jest.fn(() => true);
    await act(async () => {
      render(<ManageAppointments />);
    });
      
    await waitFor(() => {
      fireEvent.click(screen.getByText('Delete'));
    });
      
    expect(window.confirm).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText('Failed to delete appointment')).toBeInTheDocument();
    });
  });

  test('toggles dropdown visibility based on search input', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    // Enter search term - dropdown should be shown
    fireEvent.change(searchInput, { target: { value: 'B' } });
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
    
    // Clear search - dropdown should be hidden
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.queryByText('Buddy')).not.toBeInTheDocument();
    });
    
    // Click on search input with empty value - should not show dropdown
    fireEvent.click(searchInput);
    expect(screen.queryByText('Dog 1')).not.toBeInTheDocument();
  });

  test('search input focuses and shows dropdown correctly', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'B' } });
    
    // Click on the input field to trigger focus
    fireEvent.click(searchInput);
    
    // Dropdown should be visible with matching dog
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
  });

  test('clears search when clear button is clicked', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'Rex' } });
    
    // Find and click the clear button
    fireEvent.click(screen.getByText('×'));
    
    // Search input should be empty
    expect(searchInput.value).toBe('');
  });

  test('search functionality works correctly', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    fireEvent.change(searchInput, { target: { value: 'Buddy' } });
    
    // Dropdown should be visible with matching dog
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
    
    // Select the dog from dropdown
    fireEvent.click(screen.getByText('Buddy'));
    
    // Search term should be in input
    expect(searchInput.value).toBe('Buddy');
    
    // Should filter appointments to show only Buddy appointments
    fireEvent.click(screen.getByRole('tab', { name: /Upcoming Appointments/i }));
    
    // Should see upcoming appointment details
    expect(screen.getByText(/Socialization/)).toBeInTheDocument();
  });

  test('search functionality shows "No matches found" when no dogs match', async () => {
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    // Enter a search term that doesn't match any dog
    fireEvent.change(searchInput, { target: { value: 'NonExistentDog' } });
    
    // Should show "No matches found" in dropdown
    await waitFor(() => {
      expect(screen.getByText('No matches found')).toBeInTheDocument();
    });
  });

  test('handles adding training report', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 'new-report' } });
    
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Go to past appointments tab
    fireEvent.click(screen.getByText('Past Appointments'));
    
    await waitFor(() => {
      // Find and click on add training report button
      fireEvent.click(screen.getByTestId('addReport'));
    });
    
    // Fill the form
    fireEvent.change(screen.getByLabelText('Training Report'), { 
      target: { value: 'New test report content' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Report'));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:4999/api/trainingReports', 
        expect.objectContaining({
          reportText: 'New test report content'
        })
      );
    });
  });

  test('handles editing training report', async () => {
    axios.put.mockResolvedValueOnce({ data: { id: 'report1' } });
    
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Go to past appointments tab
    fireEvent.click(screen.getByText('Past Appointments'));
    
    await waitFor(() => {
      // Find and click on edit report button
      fireEvent.click(screen.getByText('Edit Report'));
    });
    
    await waitFor(() => {
      expect(screen.getByText('Edit Training Report')).toBeInTheDocument();
      
      // Verify form is pre-filled
      expect(screen.getByLabelText('Training Report').value).toBe('The dog performed well during the session.');
    });
    
    // Change report text
    fireEvent.change(screen.getByLabelText('Training Report'), { 
      target: { value: 'Updated report content' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('http://localhost:4999/api/trainingReports/report1', 
        expect.objectContaining({
          reportText: 'Updated report content'
        })
      );
    });
  });

  test('handles deleting training report with confirmation', async () => {
    axios.delete.mockResolvedValueOnce({});
    window.confirm = jest.fn().mockImplementation(() => true);
    
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Go to past appointments tab
    fireEvent.click(screen.getByText('Past Appointments'));
    
    await waitFor(() => {
      // Find and click on delete report button
      fireEvent.click(screen.getByText('Delete Report'));
    });
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this training report?');
    
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/trainingReports/report1');
    });
  });

  test('should display error alert when saving training report fails', async () => {
    // Mock axios post to reject
    axios.post.mockRejectedValueOnce(new Error('API error'));
    
    // Render component
    render(<ManageAppointments />);
    
    // Wait for initial data loading
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
    });
    
    // Find and click on the "Add Training Report" button for the first appointment
    const addReportButton = await screen.findByTestId('addReport');
    fireEvent.click(addReportButton);
    
     // Fill the form
     fireEvent.change(screen.getByLabelText('Training Report'), { 
      target: { value: 'New test report content' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Add Report' });
    fireEvent.click(submitButton);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to save training report')).toBeInTheDocument();
    });
  });

  test('should display error alert when deleting training report fails', async () => {
    // Mock window.confirm to return true
    window.confirm.mockReturnValueOnce(true);
    
    // Mock axios delete to reject
    axios.delete.mockRejectedValueOnce(new Error('Delete error'));
    
    await act(async () => {
      render(<ManageAppointments />);
    });
    
    // Wait for initial data loading
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/appointments');
    });
    
    // Find and click on Past Appointments tab
    const pastTab = screen.getByRole('tab', { name: 'Past Appointments' });
    fireEvent.click(pastTab);
    
    // Find and click on Delete Report button
    const deleteReportButtons = await screen.findAllByRole('button', { name: /Delete Report$/ });
    fireEvent.click(deleteReportButtons[0]);
    
    // Verify confirm dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this training report?');
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to delete training report')).toBeInTheDocument();
    });
  });

});