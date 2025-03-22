import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import ManageUsers from '../pages/ManageUsers';

// Mock axios
jest.mock('axios', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  }));

describe('ManageUsers Component', () => {
  const mockUsers = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      dogs: [101, 102]
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      dogs: []
    }
  ];

  const mockDogs = [
    {
      id: 101,
      name: 'Rex',
      age: '5',
      breed: 'German Shepherd',
      weight: '75',
      additionalInfo: 'Friendly',
      ownerID: 1
    },
    {
      id: 102,
      name: 'Buddy',
      age: '3',
      breed: 'Golden Retriever',
      weight: '65',
      additionalInfo: 'Loves to play',
      ownerID: 1
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:4999/api/users') {
        return Promise.resolve({ data: mockUsers });
      } else if (url.includes('/api/dogs?ownerID=1')) {
        return Promise.resolve({ data: mockDogs });
      }
      return Promise.resolve({ data: [] });
    });

    window.confirm = jest.fn(() => true);
  });

  test('renders the component and fetches users', async () => {
    render(<ManageUsers />);
    
    // Check if the component renders
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    
    // Check if users are fetched on mount
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/users');
    
    // Wait for users to be displayed
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  test('shows error message when fetching users fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });
  });

  test('opens add user modal and adds a new user', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 3 } });
    
    render(<ManageUsers />);
    
    fireEvent.click(screen.getByText('Add New User'));
    
    // Fill the form
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Johnson' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'alicej' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'alice@example.com' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add User'));
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:4999/api/users', {
        firstName: 'Alice',
        lastName: 'Johnson',
        username: 'alicej',
        email: 'alice@example.com',
        dogs: []
      });
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('User added successfully')).toBeInTheDocument();
    });
  });

  test('opens edit user modal and updates a user', async () => {
    axios.put.mockResolvedValueOnce({});
    
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click edit button for the first user
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    // Check if modal opened with user data
    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    });
    
    // Update the first name
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Johnny' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('http://localhost:4999/api/users/1', {
        firstName: 'Johnny',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        dogs: [101, 102]
      });
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('User updated successfully')).toBeInTheDocument();
    });
  });

  test('deletes a user after confirmation', async () => {
    axios.delete.mockResolvedValueOnce({});
    
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click delete button for the first user
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    // Check if confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
    
    // Check if API was called
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/users/1');
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('User deleted successfully')).toBeInTheDocument();
    });
  });

  test('opens manage dogs modal and displays dogs', async () => {
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Find and click manage dogs button for the first user
    const manageDogsButtons = screen.getAllByText('Manage Dogs');
    fireEvent.click(manageDogsButtons[0]);
    
    // Check if dogs API was called
    expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/dogs?ownerID=1');
    
    // Check if dogs are displayed
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument();
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });
  });

  test('adds a new dog', async () => {
    axios.post.mockResolvedValueOnce({ data: { id: 103 } });
    
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Open manage dogs modal
    const manageDogsButtons = screen.getAllByText('Manage Dogs');
    fireEvent.click(manageDogsButtons[0]);
    
    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.getByText('Add New Dog')).toBeInTheDocument();
    });
    
    // Click add new dog button
    fireEvent.click(screen.getByText('Add New Dog'));
    
    // Fill dog form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Max' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Breed'), { target: { value: 'Labrador' } });
    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Additional Info'), { 
      target: { value: 'Very energetic' } 
    });
    
    // Submit the form
    const addDogButton = screen.getByRole('button', { name: 'Add Dog' });
    fireEvent.click(addDogButton);
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('http://localhost:4999/api/dogs', {
        name: 'Max',
        age: '2',
        breed: 'Labrador',
        weight: '60',
        additionalInfo: 'Very energetic',
        ownerID: 1
      });
    });
  });

  test('edits an existing dog', async () => {
    axios.put.mockResolvedValueOnce({});
    
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Open manage dogs modal
    const manageDogsButtons = screen.getAllByText('Manage Dogs');
    fireEvent.click(manageDogsButtons[0]);
    
    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument();
    });
    
    // Find and click edit button for the first dog
    const dogEditButtons = screen.getAllByText('Edit').filter(btn => {
      return btn.closest('.list-group-item');
    });
    fireEvent.click(dogEditButtons[0]);
    
    // Check if modal opened with dog data
    await waitFor(() => {
      expect(screen.getByDisplayValue('Rex')).toBeInTheDocument();
      expect(screen.getByDisplayValue('German Shepherd')).toBeInTheDocument();
    });
    
    // Update the dog's name
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Rex Jr' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('http://localhost:4999/api/dogs/101', {
        name: 'Rex Jr',
        age: '5',
        breed: 'German Shepherd',
        weight: '75',
        additionalInfo: 'Friendly',
        ownerID: 1
      });
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Dog updated successfully')).toBeInTheDocument();
    });
  });

  test('deletes a dog after confirmation', async () => {
    axios.delete.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    
    render(<ManageUsers />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    // Open manage dogs modal
    const manageDogsButtons = screen.getAllByText('Manage Dogs');
    fireEvent.click(manageDogsButtons[0]);
    
    // Wait for dogs to load
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument();
    });
    
    // Find and click delete button for the first dog
    const dogDeleteButtons = screen.getAllByText('Delete').filter(btn => {
      return btn.closest('.list-group-item');
    });
    fireEvent.click(dogDeleteButtons[0]);
    
    // Check if confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this dog?');
    
    // Check if API calls were made
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/dogs/101');
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/users/1/dogs/101');
    });
    
    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Dog deleted successfully')).toBeInTheDocument();
    });
  });

  test('displays an error when saving a user fails', async () => {
    axios.post.mockRejectedValueOnce(new Error('Failed to save user'));

    render(<ManageUsers />);

    fireEvent.click(screen.getByText('Add New User'));

    // Fill out form
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });

    fireEvent.click(screen.getByText('Add User'));

    // Return error
    await waitFor(() => {
      expect(screen.getByText('Failed to save user')).toBeInTheDocument();
    });
  });

  test('displays an error when deleting a user fails', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com' }] });
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete user'));

    render(<ManageUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });
  });

  test('displays an error when fetching user dogs fails', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com' }] });
    axios.get.mockRejectedValueOnce(new Error('Failed to fetch user dogs'));

    render(<ManageUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Manage Dogs'));

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch user dogs')).toBeInTheDocument();
    });
  });

  test('displays an error when saving a dog fails', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com' }] });
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('Failed to add dog'));

    render(<ManageUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Manage the user's dogs
    fireEvent.click(screen.getByText('Manage Dogs'));

    await waitFor(() => {
      expect(screen.getByText('Add New Dog')).toBeInTheDocument();
    });

    // Add a new dog
    fireEvent.click(screen.getByText('Add New Dog'));

    // Fill out form
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Buddy' } });
    fireEvent.change(screen.getByLabelText('Age'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('Breed'), { target: { value: 'Golden Retriever' } });
    fireEvent.change(screen.getByLabelText('Weight'), { target: { value: '70' } });

    fireEvent.click(screen.getByText('Add Dog'));

    await waitFor(() => {
      expect(screen.getByText('Failed to add dog')).toBeInTheDocument();
    });
  });

  test('displays an error when deleting a dog fails', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com' }] });
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Buddy', age: '5', breed: 'Golden Retriever', weight: '70', additionalInfo: '', ownerID: 1 }] });
    axios.delete.mockRejectedValueOnce(new Error('Failed to delete dog'));

    render(<ManageUsers />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Manage Dogs'));

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    const deleteButton= screen.getAllByText('Delete');
    fireEvent.click(deleteButton[1]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete dog')).toBeInTheDocument();
    });
  });

});