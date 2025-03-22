import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ManageTrainers from '../pages/ManageTrainers';

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  }));

describe('ManageTrainers Component', () => {
  const mockTrainers = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      bio: 'bio'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      bio: 'bio bio'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    axios.get.mockResolvedValue({ data: mockTrainers });
  });

  test('renders trainer list correctly', async () => {
    render(<ManageTrainers />);
    
    // Verify page title
    expect(screen.getByText('Manage Trainers')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    // Verify trainer details are displayed
    expect(screen.getByText('johndoe | john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Biography: bio')).toBeInTheDocument();
    expect(screen.getByText('janesmith | jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('Biography: bio bio')).toBeInTheDocument();
  });

  test('shows error when fetching trainers fails', async () => {
    // Mock failed GET request
    axios.get.mockRejectedValue(new Error('Network error'));
    
    render(<ManageTrainers />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch Trainers')).toBeInTheDocument();
    });
  });

  test('opens add trainer modal when Add New Trainer button is clicked', () => {
    render(<ManageTrainers />);
    
    fireEvent.click(screen.getByText('Add New Trainer'));
    
    // Verify modal is displayed with correct title
    expect(screen.getByRole('button', { name: 'Add Trainer' })).toBeInTheDocument();
  });

  test('opens edit trainer modal when Edit button is clicked', async () => {
    render(<ManageTrainers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the Edit button for the first trainer
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Verify edit modal is displayed with correct title and pre-filled data
    expect(screen.getByText('Edit Trainer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    
    // Check form values
    const firstNameInput = screen.getByLabelText('First Name');
    expect(firstNameInput).toHaveValue('John');
  });

  test('adds a new trainer successfully', async () => {
    // Mock successful POST request
    axios.post.mockResolvedValue({});
    
    render(<ManageTrainers />);
    
    fireEvent.click(screen.getByText('Add New Trainer'));
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('First Name'), { 
      target: { value: 'Mike' } 
    });
    fireEvent.change(screen.getByLabelText('Last Name'), { 
      target: { value: 'Johnson' } 
    });
    fireEvent.change(screen.getByLabelText('Username'), { 
      target: { value: 'mikej' } 
    });
    fireEvent.change(screen.getByLabelText('Email'), { 
      target: { value: 'mike@example.com' } 
    });
    fireEvent.change(screen.getByLabelText('Bio'), { 
      target: { value: 'bio' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Add Trainer' }));
    
    // Verify POST request was made with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4999/api/trainers', 
        {
          firstName: 'Mike',
          lastName: 'Johnson',
          username: 'mikej',
          email: 'mike@example.com',
          bio: 'bio'
        }
      );
    });
    
    // Verify trainer list is refreshed
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('edits a trainer successfully', async () => {
    // Mock successful PUT request
    axios.put.mockResolvedValue({});
    
    render(<ManageTrainers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the Edit button for the first trainer
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Update form fields
    fireEvent.change(screen.getByLabelText('First Name'), { 
      target: { value: 'Johnny' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    
    // Verify PUT request was made with correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:4999/api/trainers/1', 
        {
          firstName: 'Johnny',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john@example.com',
          bio: 'bio'
        }
      );
    });
    
    // Verify trainer list is refreshed
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('deletes a trainer after confirmation', async () => {
    // Mock successful DELETE request
    axios.delete.mockResolvedValue({});

    window.confirm = jest.fn().mockImplementation(() => true);
    
    render(<ManageTrainers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the Delete button for the first trainer
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify confirmation dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this Trainer?');
    
    // Verify DELETE request was made
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/trainers/1');
    });
    
    // Verify trainer list is refreshed
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  test('does not delete a trainer if not confirmed', async () => {
    window.confirm = jest.fn().mockImplementation(() => false);
    
    render(<ManageTrainers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click the Delete button for the first trainer
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Verify confirmation dialog was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this Trainer?');
    
    // Verify DELETE request was NOT made
    expect(axios.delete).not.toHaveBeenCalled();
  });

  test('closes modal when Cancel button is clicked', async () => {
    render(<ManageTrainers />);
    
    // Click the Add New Trainer button
    fireEvent.click(screen.getByText('Add New Trainer'));
    
    // Click Cancel button
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Add Trainer' })).not.toBeInTheDocument();
    });
  });
});