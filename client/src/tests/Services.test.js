import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ServicesPage from '../pages/Services';

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  }));

describe('ServicesPage Component', () => {
  const mockServices = [
    { id: 1, name: 'Grooming', description: 'bath and haircut', price: '$300' },
    { id: 2, name: 'service2', description: 'description', price: '$100' },
    { id: 3, name: 'service3', description: 'another description', price: '$200' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<ServicesPage />);
    
    expect(screen.queryByText('Our Services')).toBeInTheDocument();
    expect(screen.queryByText('Grooming')).not.toBeInTheDocument();
    expect(screen.queryByText('Failed to fetch services')).not.toBeInTheDocument();
  });

  test('renders services when API call succeeds', async () => {
    axios.get.mockResolvedValue({ data: mockServices });
    
    render(<ServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Grooming')).toBeInTheDocument();
      expect(screen.getByText('service2')).toBeInTheDocument();
      expect(screen.getByText('service3')).toBeInTheDocument();

      // Verify descriptions and prices
      expect(screen.getByText('bath and haircut')).toBeInTheDocument();
      expect(screen.getByText('$300')).toBeInTheDocument();
      expect(screen.getByText('description')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
      expect(screen.getByText('another description')).toBeInTheDocument();
      expect(screen.getByText('$200')).toBeInTheDocument();
    });
    
    // Verify API was called with correct URL
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/ServiceLibrary');
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  test('renders error message when API call fails', async () => {
    // Mock failed API response
    axios.get.mockRejectedValue(new Error('Network error'));
    
    render(<ServicesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch services')).toBeInTheDocument();
    });
    
    // Verify services are not displayed
    expect(screen.queryByText('service2')).not.toBeInTheDocument();
    
    // Verify header is not displayed when in error state
    expect(screen.queryByText('Our Services')).not.toBeInTheDocument();
  });

  test('renders empty services grid when API returns empty array', async () => {
    // Mock API response with empty array
    axios.get.mockResolvedValue({ data: [] });
    
    render(<ServicesPage />);
    
    // Wait for component to finish rendering
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });
    
    // Verify header is still displayed
    expect(screen.getByText('Our Services')).toBeInTheDocument();
    
    // Verify no service cards are rendered
    expect(screen.queryByText('Grooming')).not.toBeInTheDocument();
    expect(screen.queryByText('service2')).not.toBeInTheDocument();
    expect(screen.queryByText('service3')).not.toBeInTheDocument();
    
    // No error message should be displayed
    expect(screen.queryByText('Failed to fetch services')).not.toBeInTheDocument();
  });
});