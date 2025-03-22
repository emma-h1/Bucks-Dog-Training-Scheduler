import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../pages/ResetPassword';
import { sendPasswordResetEmail } from 'firebase/auth';

// Mock firebase modules
jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('../firebase', () => ({
  auth: {},
}));

// Mock window.alert
global.alert = jest.fn();

describe('ResetPassword Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders reset password form', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Check that all elements are rendered
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByText('Return to login:')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('updates email input value when user types', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    
    expect(emailInput.value).toBe('test@email.com');
  });

  test('sends password reset email when form is submitted', async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();
    
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Fill out the form
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Check that the reset email function was called with correct parameters
      expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, 'test@email.com');
      expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      
      // Check that alert was shown
      expect(global.alert).toHaveBeenCalledWith('Email sent.');
    });
  });

  test('shows error message when sending email fails', async () => {
    // Mock the rejected promise
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('Firebase error'));
    
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Fill out the form
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@email.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      // Check that the error message is displayed
      expect(screen.getByText('Cannot send email')).toBeInTheDocument();
      
      // Verify that the function was called but the alert wasn't shown
      expect(sendPasswordResetEmail).toHaveBeenCalledWith({}, 'test@email.com');
      expect(global.alert).not.toHaveBeenCalled();
    });
  });

  test('navigates to login page when login link is clicked', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    const loginLink = screen.getByText('Login');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
  
  test('form requires email input', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Get the email input and verify it's required
    const emailInput = screen.getByPlaceholderText('Email');
    expect(emailInput).toHaveAttribute('required');
  });
});