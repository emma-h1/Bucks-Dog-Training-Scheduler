import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import ManageProfile from '../pages/ManageProfile';
import { auth } from '../firebase';

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  patch: jest.fn(() => Promise.resolve({ data: {} }))
}));

jest.mock('../firebase', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id'
    },
    onAuthStateChanged: jest.fn()
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('ManageProfile Component', () => {
  const mockUserData = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockDogsData = [
    {
      id: 'dog1',
      name: 'Buddy',
      age: '3',
      breed: 'Golden Retriever',
      weight: '65',
      additionalInfo: 'Deaf',
      ownerID: 'test-user-id'
    },
    {
      id: 'dog2',
      name: 'Max',
      age: '2',
      breed: 'Pug',
      weight: '10',
      additionalInfo: 'Good with kids',
      ownerID: 'test-user-id'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.resolve({ data: mockUserData });
      } else if (url.includes('/api/dogs')) {
        return Promise.resolve({ data: mockDogsData });
      }
      return Promise.reject(new Error('Not found'));
    });

    axios.put.mockResolvedValue({ data: { success: true } });
    axios.post.mockResolvedValue({ data: { id: 'new-dog-id', success: true } });
    axios.delete.mockResolvedValue({ data: { success: true } });
    axios.patch.mockResolvedValue({ data: { success: true } });

    // Default implementation for auth state change - authenticated user
    auth.onAuthStateChanged.mockImplementation(callback => {
      callback({ uid: 'test-user-id' });
      return jest.fn();
    });
  });

  test('renders profile information and loads data correctly when user is authenticated', async () => {
    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    // Verify that onAuthStateChanged was called
    expect(auth.onAuthStateChanged).toHaveBeenCalled();

    // Verify profile heading is displayed
    expect(screen.getByText('Manage Profile')).toBeInTheDocument();
    
    // Wait for API data to load
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/users/test-user-id');
      expect(axios.get).toHaveBeenCalledWith('http://localhost:4999/api/dogs?ownerID=test-user-id');
    });

    // Verify profile data is displayed
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('testuser')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    // Verify dog data is displayed
    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
      expect(screen.getByText('Max')).toBeInTheDocument();
    });
  });

  test('does not fetch profile data when user is not authenticated', async () => {
    auth.onAuthStateChanged.mockImplementationOnce(callback => {
      callback(null); // No user
      return jest.fn();
    });

    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );
    
    // Verify that auth check was called
    expect(auth.onAuthStateChanged).toHaveBeenCalled();

    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verify that API calls were not made since user is null
    expect(axios.get).not.toHaveBeenCalled();
  });


  test('allows editing all profile fields', async () => {
    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    const fieldTests = [
      { fieldName: 'email', label: 'Email', oldValue: 'test@example.com', newValue: 'updated@example.com' },
      { fieldName: 'username', label: 'Username', oldValue: 'testuser', newValue: 'newusername' },
      { fieldName: 'firstName', label: 'First Name', oldValue: 'Test', newValue: 'Jane' },
      { fieldName: 'lastName', label: 'Last Name', oldValue: 'User', newValue: 'Doe' }
    ];

    for (const { fieldName, label, oldValue, newValue } of fieldTests) {
      axios.put.mockClear();
      
      // Find the field container by label and click to toggle edit mode
      const togglerElement = screen.getByText(label);
      // Navigate up to the parent container
      const fieldContainer = togglerElement.closest('.mb-3');
      // Find the clickable header element within the container
      const toggleButton = fieldContainer.querySelector('.d-flex.justify-content-between');
      fireEvent.click(toggleButton);

      // Input field should now be visible
      const input = await waitFor(() => fieldContainer.querySelector('input'));
      expect(input).toBeInTheDocument();
      expect(input.value).toBe(oldValue);

      // Change field value
      fireEvent.change(input, { target: { value: newValue } });
      expect(input.value).toBe(newValue);

      // Save changes
      const saveButton = fieldContainer.querySelector('button');
      fireEvent.click(saveButton);

      // Verify API call was made with updated data
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          'http://localhost:4999/api/users/test-user-id',
          expect.objectContaining({ [fieldName]: newValue })
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
      });

      // Verify edit mode is closed after saving
      await waitFor(() => {
        const fieldAfterSave = screen.getByText(label).closest('.mb-3');
        expect(fieldAfterSave.querySelector('input')).toBeNull();
      });
    }
  });

  test('handles API errors when editing profile', async () => {
    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    // Mock API failure for the PUT request
    axios.put.mockRejectedValueOnce(new Error('API error'));

    // Find the email field container and click to toggle edit mode
    const emailLabel = screen.getByText('Email');
    const emailContainer = emailLabel.closest('.mb-3');
    const toggleButton = emailContainer.querySelector('.d-flex.justify-content-between');
    fireEvent.click(toggleButton);

    // Input field should now be visible
    const emailInput = await waitFor(() => emailContainer.querySelector('input'));
    
    // Change email value
    fireEvent.change(emailInput, { target: { value: 'error@example.com' } });

    // Save changes
    const saveButton = emailContainer.querySelector('button');
    fireEvent.click(saveButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
    });
  });

  test('handles adding a new dog', async () => {
    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Dogs')).toBeInTheDocument();
    });

    // Click "Add Dog" button
    fireEvent.click(screen.getByText('Add Dog'));

    // Fill out dog form
    const nameInput = screen.getByLabelText('Name');
    const ageInput = screen.getByLabelText('Age');
    const breedInput = screen.getByLabelText('Breed');
    const weightInput = screen.getByLabelText('Weight');
    const infoInput = screen.getByLabelText('Additional Info');

    fireEvent.change(nameInput, { target: { value: 'Charlie' } });
    fireEvent.change(ageInput, { target: { value: '4' } });
    fireEvent.change(breedInput, { target: { value: 'Labrador' } });
    fireEvent.change(weightInput, { target: { value: '50' } });
    fireEvent.change(infoInput, { target: { value: 'none' } });

    const saveButtons = screen.getAllByText('Add Dog');
    const modalSaveButton = saveButtons.find(button => 
      button.closest('.modal-footer')
    );
    fireEvent.click(modalSaveButton);

    // Verify API calls
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4999/api/dogs',
        expect.objectContaining({
          name: 'Charlie',
          age: '4',
          breed: 'Labrador',
          weight: '50',
          additionalInfo: 'none',
          ownerID: 'test-user-id'
        })
      );
    });

    // Verify dog was associated with user
    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        'http://localhost:4999/api/users/test-user-id',
        { dogs: ['new-dog-id'] }
      );
    });

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText('Dog added successfully')).toBeInTheDocument();
    });
  });

  test('handles editing an existing dog', async () => {
    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    // Find and click the edit button for Buddy
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);

    // Modal should be visible
    expect(screen.getByText('Edit Dog')).toBeInTheDocument();

    // Modify dog information
    const nameInput = screen.getByLabelText('Name');
    expect(nameInput.value).toBe('Buddy');
    
    fireEvent.change(nameInput, { target: { value: 'Buddy Jr.' } });

    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Verify API call with updated data
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        'http://localhost:4999/api/dogs/dog1',
        expect.objectContaining({ name: 'Buddy Jr.' })
      );
    });

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText('Dog updated successfully')).toBeInTheDocument();
    });
  });

  test('handles removing a dog', async () => {
    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Buddy')).toBeInTheDocument();
    });

    // Find and click the remove button for Buddy
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    // Verify API calls
    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/dogs/dog1');
      expect(axios.delete).toHaveBeenCalledWith('http://localhost:4999/api/users/test-user-id/dogs/dog1');
    });

    // Verify success message appears
    await waitFor(() => {
      expect(screen.getByText('Dog removed successfully')).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/users/')) {
        return Promise.reject(new Error('API error'));
      }
      return Promise.reject(new Error('Not found'));
    });

    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
    });
  });

  test('navigates to reset password page when button is clicked', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    render(
      <BrowserRouter>
        <ManageProfile />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
    });

    // Click reset password button
    fireEvent.click(screen.getByText('Reset Password'));

    // Verify navigation was called
    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });
});