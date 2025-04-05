import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import AllCalendar from '../pages/AllCalendar';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

// Create a mock module storage to store props
const mockFullCalendarProps = {
  events: []
};

// Mock the FullCalendar component and its plugins
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar(props) {
    mockFullCalendarProps.events = props.events;
    mockFullCalendarProps.headerToolbar = props.headerToolbar;
    mockFullCalendarProps.plugins = props.plugins;
    mockFullCalendarProps.initialView = props.initialView;
    
    return <div data-testid="full-calendar">{props.events.length} events</div>;
  };
});

jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/timegrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));
jest.mock('@fullcalendar/list', () => ({}));

describe('AllCalendar Component', () => {
  const mockAppointments = [
    {
      id: '1',
      dog: 'dog1',
      trainer: 'trainer1',
      owner: 'John Doe',
      location: 'Park',
      purpose: 'Training',
      balanceDue: 50,
      startTime: '2025-04-01T10:00:00',
      endTime: '2025-04-01T11:00:00'
    },
    {
      id: '2',
      dog: 'dog2',
      trainer: 'trainer2',
      owner: 'Jane Smith',
      location: 'Building',
      purpose: 'Boarding',
      balanceDue: 75,
      startTime: '2025-04-02T14:00:00',
      endTime: '2025-04-02T15:00:00'
    }
  ];

  const mockDogs = [
    { id: 'dog1', name: 'Rex' },
    { id: 'dog2', name: 'Lucky' }
  ];

  const mockTrainers = [
    { id: 'trainer1', firstName: 'Sam', lastName: 'Last' },
    { id: 'trainer2', firstName: 'Sara', lastName: 'Green' }
  ];

  beforeEach(() => {
    // Mock API calls
    axios.get.mockImplementation((url) => {
      if (url === '/api/appointments') {
        return Promise.resolve({ data: mockAppointments });
      } else if (url === 'http://localhost:4999/api/dogs') {
        return Promise.resolve({ data: mockDogs });
      } else if (url === 'http://localhost:4999/api/trainers') {
        return Promise.resolve({ data: mockTrainers });
      }
      return Promise.reject(new Error('Not found'));
    });

    mockFullCalendarProps.events = [];
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders calendar and fetches data', async () => {
    await act(async () => {
      render(<AllCalendar />);
    });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(axios.get).toHaveBeenCalledWith('/api/appointments');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/dogs');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/trainers');
    });

    // Check if FullCalendar is rendered
    expect(screen.getByTestId('full-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('full-calendar')).toHaveTextContent('2 events');
    expect(mockFullCalendarProps.events.length).toBe(2);
  });

  test('filters events when selectedDog prop changes', async () => {
    await act(async () => {
      render(<AllCalendar selectedDog={null} />);
    });

    // Wait for initial data fetch
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(3);
    });

    // Initially should show all events
    expect(screen.getByTestId('full-calendar')).toHaveTextContent('2 events');
    expect(mockFullCalendarProps.events.length).toBe(2);

    // Update component with a selected dog
    await act(async () => {
      render(<AllCalendar selectedDog="dog1" />);
    });

    // Should filter to only show events for dog 101
    await waitFor(() => {
      expect(mockFullCalendarProps.events.length).toBe(1);
      expect(mockFullCalendarProps.events[0].extendedProps.dogID).toBe('dog1');
    });
  });

  test('handles API error gracefully', async () => {
    // Mock API error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('API error'));

    await act(async () => {
      render(<AllCalendar />);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error fetching data:', 
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('handles missing dog or trainer information', async () => {
    // Mock incomplete data
    const incompleteAppointments = [
      {
        id: '3',
        dog: 'dog3', // non-existent dog
        trainer: 'trainer3', // non-existent trainer
        owner: 'Unknown Owner',
        startTime: '2025-04-03T09:00:00',
        endTime: '2025-04-03T10:00:00'
      }
    ];

    axios.get.mockImplementation((url) => {
      if (url === '/api/appointments') {
        return Promise.resolve({ data: incompleteAppointments });
      } else if (url === 'http://localhost:4999/api/dogs') {
        return Promise.resolve({ data: mockDogs });
      } else if (url === 'http://localhost:4999/api/trainers') {
        return Promise.resolve({ data: mockTrainers });
      }
    });

    await act(async () => {
      render(<AllCalendar />);
    });

    await waitFor(() => {
      expect(mockFullCalendarProps.events.length).toBe(1);
      expect(mockFullCalendarProps.events[0].title).toBe('Trainer: Unknown Trainer - Dog: Unknown Dog');
    });
  });
});