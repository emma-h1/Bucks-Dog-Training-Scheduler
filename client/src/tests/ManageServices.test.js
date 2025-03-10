import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import ManageServices from '../pages/ManageServices';

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  }));

  describe('ManageServices Component', () => {
    const mockServices = [
      {
        id: 1,
        name: 'Basic Training',
        description: 'Fundamental obedience training for your dog',
        price: '$100'
      },
      {
        id: 2,
        name: 'Advanced Training',
        description: 'Advanced commands and behavioral correction',
        price: '$200'
      },
      {
        id: 3,
        name: 'Boarding',
        description: 'Overnight care for your dog in a comfortable environment',
        price: '$50 per night'
      }
    ];
  
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
      
      // Mock successful GET request
      axios.get.mockResolvedValue({ data: mockServices });
      
      // Mock window.confirm to always return true
      global.window.confirm = jest.fn(() => true);
    });
  
    test('renders manage services page with header', async () => {
      render(<ManageServices />);
      
      // Check if header is rendered
      expect(screen.getByText('Manage Services')).toBeInTheDocument();
      
      // Wait for services to load
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/ServiceLibrary');
      });
    });
  
    test('displays services correctly', async () => {
      render(<ManageServices />);
      
      // Wait for services to be displayed
      await waitFor(() => {
        expect(screen.getByText('Basic Training')).toBeInTheDocument();
        expect(screen.getByText('Fundamental obedience training for your dog')).toBeInTheDocument();
        expect(screen.getByText('$100')).toBeInTheDocument();
        
        expect(screen.getByText('Advanced Training')).toBeInTheDocument();
        expect(screen.getByText('Advanced commands and behavioral correction')).toBeInTheDocument();
        
        expect(screen.getByText('Boarding')).toBeInTheDocument();
        expect(screen.getByText('$50 per night')).toBeInTheDocument();
      });
    });
  
    test('opens add service modal when add button is clicked', async () => {
      render(<ManageServices />);
      
      // Click the add button
      fireEvent.click(screen.getByText('Add New Service'));
      
      // Check if modal is opened with correct title
      expect(screen.getByText('Add New Service')).toBeInTheDocument();
      expect(screen.getByLabelText('Service Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('Price')).toBeInTheDocument();
      
      // Check if form fields are empty
      expect(screen.getByLabelText('Service Name')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Price')).toHaveValue('');
    });
  
    test('opens edit service modal with service data', async () => {
      render(<ManageServices />);
      
      // Wait for services to load
      await waitFor(() => {
        expect(screen.getByText('Basic Training')).toBeInTheDocument();
      });
      
      // Find and click the Edit button for the first service
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      // Check if modal is opened with correct title and data
      expect(screen.getByText('Edit Service')).toBeInTheDocument();
      
      // Verify form fields are filled with service data
      expect(screen.getByLabelText('Service Name')).toHaveValue('Basic Training');
      expect(screen.getByLabelText('Description')).toHaveValue('Fundamental obedience training for your dog');
      expect(screen.getByLabelText('Price')).toHaveValue('$100');
    });
  
    test('submits new service correctly', async () => {
      // Mock successful POST request
      axios.post.mockResolvedValue({ data: { id: 4, name: 'Group Class', description: 'Training in a group setting', price: '$75' } });
      
      render(<ManageServices />);
      
      // Click add button
      fireEvent.click(screen.getByText('Add New Service'));
      
      // Fill out form
      fireEvent.change(screen.getByLabelText('Service Name'), { target: { value: 'Group Class' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Training in a group setting' } });
      fireEvent.change(screen.getByLabelText('Price'), { target: { value: '$75' } });
      
      // Submit form
      fireEvent.click(screen.getByText('Add Service'));
      
      // Verify API call
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('http://localhost:4999/api/ServiceLibrary', {
          name: 'Group Class',
          description: 'Training in a group setting',
          price: '$75'
        });
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + after add
      });
    });
  
    test('edits service correctly', async () => {
      // Mock successful PUT request
      axios.put.mockResolvedValue({ data: { ...mockServices[0], name: 'Updated Basic Training' } });
      
      render(<ManageServices />);
      
      // Wait for services to load
      await waitFor(() => {
        expect(screen.getByText('Basic Training')).toBeInTheDocument();
      });
      
      // Find and click the Edit button for the first service
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      // Update form field
      fireEvent.change(screen.getByLabelText('Service Name'), { target: { value: 'Updated Basic Training' } });
      
      // Submit form
      fireEvent.click(screen.getByText('Save Changes'));
      
      // Verify API call
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('http://localhost:4999/api/ServiceLibrary/1', {
          name: 'Updated Basic Training',
          description: 'Fundamental obedience training for your dog',
          price: '$100'
        });
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + after edit
      });
    });
  
    test('deletes service correctly', async () => {
      // Mock successful DELETE request
      axios.delete.mockResolvedValue({ data: {} });
      
      render(<ManageServices />);
      
      // Wait for services to load
      await waitFor(() => {
        expect(screen.getByText('Basic Training')).toBeInTheDocument();
      });
      
      // Find and click the Delete button for the first service
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      
      // Verify confirmation dialog was shown
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this service?');
      
      // Verify API call
      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/ServiceLibrary/1');
        expect(axios.get).toHaveBeenCalledTimes(2); // Initial load + after delete
      });
    });
  
    test('handles API errors gracefully when fetching services', async () => {
      // Mock failed GET request
      axios.get.mockRejectedValueOnce(new Error('API error'));
      
      render(<ManageServices />);
      
      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to fetch services')).toBeInTheDocument();
      });
    });
  
    test('handles add service form submission errors gracefully', async () => {
      // Mock failed POST request
      axios.post.mockRejectedValueOnce(new Error('API error'));
      
      render(<ManageServices />);
      
      // Click add button
      fireEvent.click(screen.getByText('Add New Service'));
      
      // Fill out form
      fireEvent.change(screen.getByLabelText('Service Name'), { target: { value: 'Group Class' } });
      fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Training in a group setting' } });
      fireEvent.change(screen.getByLabelText('Price'), { target: { value: '$75' } });
      
      // Submit form
      fireEvent.click(screen.getByText('Add Service'));
      
      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to save service')).toBeInTheDocument();
      });
    });
  
    test('handles edit service form submission errors gracefully', async () => {
      // Mock failed PUT request
      axios.put.mockRejectedValueOnce(new Error('API error'));
      
      render(<ManageServices />);
      
      // Wait for services to load
      await waitFor(() => {
        expect(screen.getByText('Basic Training')).toBeInTheDocument();
      });
      
      // Find and click the Edit button for the first service
      const editButtons = screen.getAllByText('Edit');
      fireEvent.click(editButtons[0]);
      
      // Submit form without changes
      fireEvent.click(screen.getByText('Save Changes'));
      
      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to save service')).toBeInTheDocument();
      });
    });
  
    test('handles delete service errors gracefully', async () => {
      // Mock failed DELETE request
      axios.delete.mockRejectedValueOnce(new Error('API error'));
      
      render(<ManageServices />);
      
      // Wait for services to load
      await waitFor(() => {
        expect(screen.getByText('Basic Training')).toBeInTheDocument();
      });
      
      // Find and click the Delete button for the first service
      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);
      
      // Verify error message
      await waitFor(() => {
        expect(screen.getByText('Failed to delete service')).toBeInTheDocument();
      });
    });
  
    test('closes modal when cancel button is clicked', async () => {
      render(<ManageServices />);
      
      // Click add button
      fireEvent.click(screen.getByText('Add New Service'));
      
      // Verify modal is open
      expect(screen.getByText('Add New Service')).toBeInTheDocument();
      
      // Click cancel button
      fireEvent.click(screen.getByText('Cancel'));
      
      // Verify modal is closed
      await waitFor(() => {
        expect(screen.queryByLabelText('Service Name')).not.toBeInTheDocument();
      });
    });
  });