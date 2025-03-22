import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../pages/SignIn';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import axios from 'axios';

// Mock the modules
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: [] })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../firebase', () => ({
  auth: {},
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders signup form', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByText('Already a user?')).toBeInTheDocument();
  });

  test('displays error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'johndoe@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password456' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    
    // Check error message
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match!')).toBeInTheDocument();
    });
    
    // Ensure Firebase and axios weren't called
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('successfully creates account and redirects', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-uid' }
    });
    
    axios.post.mockResolvedValue({ data: { success: true } });
    
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Fill out the form with matching passwords
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'johndoe@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    
    await waitFor(() => {
      // Check that Firebase auth was called with correct params
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        'johndoe@email.com',
        'password123'
      );
      
      // Check that axios post was called with correct data
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4999/api/auth/register',
        {
          uid: 'test-uid',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'johndoe@email.com'
        }
      );
      
      // Check navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('displays error when Firebase throws exception', async () => {
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Firebase error'));
    
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    // Fill out the form with matching passwords
    fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'johndoe@email.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
    
    await waitFor(() => {
      expect(screen.getByText('Firebase error')).toBeInTheDocument();
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});