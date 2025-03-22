import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LogIn from '../pages/LogIn';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, getIdToken } from 'firebase/auth';

// Mock the dependencies
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

jest.mock('../firebase', () => ({
  auth: {
    currentUser: null
  }
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  setPersistence: jest.fn(),
  browserLocalPersistence: 'local',
  getIdToken: jest.fn()
}));

// Mock the logo import
jest.mock('../assets/logoNoText.png', () => 'mocked-logo-path');

describe('LogIn Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    global.fetch = jest.fn();
  });

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    // Check if essential elements are rendered
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
  });

  test('updates email and password state on input change', () => {
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('submits the form and navigates on successful login', async () => {
    setPersistence.mockResolvedValue();
    signInWithEmailAndPassword.mockResolvedValue({ user: {} });
    auth.currentUser = { /* mock user object */ };
    getIdToken.mockResolvedValue('mock-id-token');
    
    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'Success' })
    });
    
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'password123' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Verify the authentication functions were called with correct arguments
    await waitFor(() => {
      expect(setPersistence).toHaveBeenCalledWith(auth, browserLocalPersistence);
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'test@example.com', 'password123');
      expect(getIdToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith('/protected', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-id-token'
        }
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
  
  test('handles the case when user is null after authentication', async () => {
    // Set up mocks with successful authentication but null user
    setPersistence.mockResolvedValue();
    signInWithEmailAndPassword.mockResolvedValue({ user: {} });
    
    // Set currentUser to null to test the if(user) condition
    auth.currentUser = null;
    
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'password123' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Verify that getIdToken and fetch were not called
    await waitFor(() => {
      expect(setPersistence).toHaveBeenCalled();
      expect(signInWithEmailAndPassword).toHaveBeenCalled();
      expect(getIdToken).not.toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('displays an error message on authentication failure', async () => {
    const errorMessage = 'Invalid email or password';
    setPersistence.mockResolvedValue();
    signInWithEmailAndPassword.mockRejectedValue(new Error(errorMessage));
    
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'wrongpassword' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('displays error on failed fetch request', async () => {
    // Set up successful authentication but failed fetch
    setPersistence.mockResolvedValue();
    signInWithEmailAndPassword.mockResolvedValue({ user: {} });
    auth.currentUser = { };
    getIdToken.mockResolvedValue('mock-id-token');
    
    global.fetch.mockResolvedValue({
      ok: false
    });
    
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    // Fill in and submit form
    fireEvent.change(screen.getByPlaceholderText('Email'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), { 
      target: { value: 'password123' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    
    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch protected route')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('navigates to reset password page when clicking reset password link', () => {
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    const resetPasswordLink = screen.getByText('Reset Password');
    expect(resetPasswordLink.getAttribute('href')).toBe('/reset-password');
  });

  test('navigates to sign up page when clicking sign up link', () => {
    render(
      <BrowserRouter>
        <LogIn />
      </BrowserRouter>
    );
    
    const signUpLink = screen.getByText('Sign Up');
    expect(signUpLink.getAttribute('href')).toBe('/signin');
  });
});