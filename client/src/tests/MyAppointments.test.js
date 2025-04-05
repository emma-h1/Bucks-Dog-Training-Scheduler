import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MyAppointments from '../pages/MyAppointments';
import { auth } from '../firebase';

// Mock dependencies
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
}));
  
jest.mock('../firebase', () => ({
  auth: {
    currentUser: { uid: 'owner1' },
    onAuthStateChanged: jest.fn()
  }
}));
jest.mock('../pages/SelfCalendar', () => ({ selectedDog }) => <div data-testid="calendar-component" data-selected-dog={selectedDog} />);

describe('MyAppointments Component', () => {
  const mockDogs = [
    { id: 'dog1', name: 'Dog 1' },
    { id: 'dog2', name: 'Dog 2' },
    { id: 'dog3', name: 'Dog 3' }
  ];
  
  const mockUsers = [
    { id: 'owner1', firstName: 'John', lastName: 'Doe' },
    { id: 'owner2', firstName: 'Gina', lastName: 'Farmer' }
  ];
  
  const mockTrainers = [
    { id: 'trainer1', firstName: 'Jane', lastName: 'Smith' }
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(24, 24, 24, 24);
  
  const mockAppointments = [
    {
      id: 'appt1',
      dog: 'dog1',
      owner: 'owner1',
      trainer: 'trainer1',
      startTime: '2025-04-01T10:00:00',
      endTime: '2025-04-01T11:00:00',
      location: 'Training Center',
      balanceDue: '$50',
      purpose: 'Basic Training'
    },
    {
      id: 'appt2',
      dog: 'dog2',
      owner: 'owner2',
      trainer: 'trainer2',
      startTime: '2025-04-01T10:00:00',
      endTime: '2025-04-01T11:00:00',
      location: 'Park',
      balanceDue: '$75',
      purpose: 'Behavioral Training'
    },
    {
      id: 'appt3',
      dog: 'dog3',
      owner: 'owner1',
      trainer: 'trainer1',
      startTime: '2025-04-01T10:00:00',
      endTime: '2025-04-01T11:00:00',
      location: 'Home',
      balanceDue: '$0',
      purpose: 'Behavior Evaluation'
    },
    {
      id: 'appt4',
      dog: 'dog1',
      owner: 'owner1',
      trainer: 'trainer1',
      startTime: '2025-04-01T10:00:00',
      endTime: '2025-04-01T11:00:00',
      location: null, // Testing null location
      balanceDue: null, // Testing null balanceDue
      purpose: null // Testing null purpose
    },
    {
      id: 'appt5',
      dog: 'unknown-dog', // Dog not in dogs list
      owner: 'owner1',
      trainer: 'unknown-trainer', // Trainer not in trainers list
      startTime: '2025-04-01T10:00:00',
      endTime: '2025-04-01T11:00:00',
      location: 'Pool',
      balanceDue: '$100',
      purpose: 'Swimming Lesson'
    },
    {
      id: 'appt6',
      dog: 'dog2',
      owner: 'unknown-owner', // Owner not in owners list
      trainer: 'trainer1',
      startTime: 'invalid-date', // Invalid date format
      endTime: 'invalid-date', // Invalid date format
      location: 'Mountain',
      balanceDue: '$120',
      purpose: 'Agility Training'
    }
  ];
  
  const mockTrainingReports = [
    {
      id: 'report1',
      appointment: 'appt3', // This matches the past appointment
      reportText: 'The dog performed well during the session.'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    auth.onAuthStateChanged.mockImplementation(callback => {
      callback({ uid: 'owner1' });
      return jest.fn();
    });
    
    // Setup API calls
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/appointments')) {
        return Promise.resolve({ data: mockAppointments });
      } else if (url.includes('/api/dogs')) {
        return Promise.resolve({ data: mockDogs });
      } else if (url.includes('/api/users')) {
        return Promise.resolve({ data: mockUsers });
      } else if (url.includes('/api/trainers')) {
        return Promise.resolve({ data: mockTrainers });
      } else if (url.includes('/api/trainingReports')) {
        return Promise.resolve({ data: mockTrainingReports });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  test('renders the component with tabs', async () => {
    await act(async () => {
      render(<MyAppointments />);
    });
    
    expect(screen.getByText('My Appointments')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Today's Appointments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Upcoming Appointments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Past Appointments/i })).toBeInTheDocument();
  });

  test('handles user not authenticated', async () => {
    auth.onAuthStateChanged.mockImplementation(callback => {
      callback(null); // No logged in user
      return jest.fn();
    });
    
    await act(async () => {
      render(<MyAppointments />);
    });
    
    expect(screen.getByText('no user')).toBeInTheDocument();
  });

  test('search functionality works correctly', async () => {
    await act(async () => {
      render(<MyAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    fireEvent.change(searchInput, { target: { value: 'Dog 1' } });
    
    // Dropdown should be visible with matching dog
    await waitFor(() => {
      expect(screen.getByText('Dog 1')).toBeInTheDocument();
    });
    
    // Select the dog from dropdown
    fireEvent.click(screen.getByText('Dog 1'));
    
    // Search term should be in input
    expect(searchInput.value).toBe('Dog 1');
    
    // Should filter appointments to show only Dog 1 appointments
    fireEvent.click(screen.getByRole('tab', { name: /Upcoming Appointments/i }));
    
    // Should see upcoming appointment details
    expect(screen.getByText(/Basic Training/)).toBeInTheDocument();
  });

  test('search functionality shows "No matches found" when no dogs match', async () => {
    await act(async () => {
      render(<MyAppointments />);
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

  test('handles appointment API errors gracefully', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/appointments')) {
        return Promise.reject(new Error('Appointments API Error'));
      }
      return Promise.resolve({ data: [] });
    });
    
    await act(async () => {
      render(<MyAppointments />);
    });
    
    expect(screen.getByText('Failed to fetch appointments')).toBeInTheDocument();
  });

  test('handles document API errors gracefully', async () => {
    // Documents API error (dogs/users/trainers)
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/appointments')) {
        return Promise.resolve({ data: [] });
      } else if (url.includes('/api/dogs') || url.includes('/api/users') || url.includes('/api/trainers')) {
        return Promise.reject(new Error('Documents API Error'));
      } else {
        return Promise.resolve({ data: [] });
      }
    });
    
    await act(async () => {
      render(<MyAppointments />);
    });
    
    expect(screen.getByText('Failed to fetch document lists')).toBeInTheDocument();
  });

  test('handles training report API errors gracefully', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/appointments')) {
        return Promise.resolve({ data: [] });
      } else if (url.includes('/api/dogs') || url.includes('/api/users') || url.includes('/api/trainers')) {
        return Promise.resolve({ data: [] });
      } else if (url.includes('/api/trainingReports')) {
        return Promise.reject(new Error('Training Reports API Error'));
      }
      return Promise.resolve({ data: [] });
    });
    
    await act(async () => {
      render(<MyAppointments />);
    });
    
    expect(screen.getByText('Failed to fetch training reports')).toBeInTheDocument();
  });

  test('clears search when clear button is clicked', async () => {
    await act(async () => {
      render(<MyAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'Dog 1' } });
    
    // Find and click the clear button
    fireEvent.click(screen.getByText('×'));
    
    // Search input should be empty
    expect(searchInput.value).toBe('');
  });

  test('toggles dropdown visibility based on search input', async () => {
    await act(async () => {
      render(<MyAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    // Enter search term - dropdown should be shown
    fireEvent.change(searchInput, { target: { value: 'D' } });
    await waitFor(() => {
      expect(screen.getByText('Dog 1')).toBeInTheDocument();
    });
    
    // Clear search - dropdown should be hidden
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      expect(screen.queryByText('Dog 1')).not.toBeInTheDocument();
    });
    
    // Click on search input with empty value - should not show dropdown
    fireEvent.click(searchInput);
    expect(screen.queryByText('Dog 1')).not.toBeInTheDocument();
  });

  test('search input focuses and shows dropdown correctly', async () => {
    await act(async () => {
      render(<MyAppointments />);
    });
    
    // Find the search input
    const searchInput = screen.getByPlaceholderText('Search by dog name');
    
    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'D' } });
    
    // Click on the input field to trigger focus
    fireEvent.click(searchInput);
    
    // Dropdown should be visible with matching dog
    await waitFor(() => {
      expect(screen.getByText('Dog 1')).toBeInTheDocument();
    });
  });
});