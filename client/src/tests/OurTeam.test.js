import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import OurTeam from '../pages/OurTeam';

jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
}));

describe('OurTeam Component', () => {
  const mockTrainers = [
    { 
      id: 1, 
      firstName: 'John', 
      lastName: 'Doe', 
      bio: 'biography' 
    },
    { 
      id: 2, 
      firstName: 'Jane', 
      lastName: 'Smith', 
      bio: 'another bio' 
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: mockTrainers });
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {}));
    
    render(<OurTeam />);
    
    // The component should render without trainers initially
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  test('renders trainers when API call is successful', async () => {
    axios.get.mockResolvedValue({ data: mockTrainers });
    
    render(<OurTeam />);
    
    // Wait for the API call to resolve and component to update
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('biography')).toBeInTheDocument();
      expect(screen.getByText('another bio')).toBeInTheDocument();
    });
    
    // Verify that the API was called correctly
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/trainers');
  });

  test('renders error message when API call fails', async () => {
    // Mock failed API response
    axios.get.mockRejectedValue(new Error('API Error'));
    
    render(<OurTeam />);
    
    // Wait for the error state to be displayed
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch trainers')).toBeInTheDocument();
    });
  });
});