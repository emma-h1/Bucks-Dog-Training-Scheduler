import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPassword from '../pages/ResetPassword';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import userEvent from '@testing-library/user-event';

// Mock firebase
jest.mock('../firebase', () => ({
  auth: {}
}));

// Mock sendPasswordResetEmail
jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(() => Promise.resolve()), // Mock resolved Promise
}));

// Mock logo
jest.mock('../assets/logoNoText.png', () => 'logo-mock');

// Mock window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;

describe('Reset Password Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe('Component Rendering', () => {
    test('renders reset password form', () => {
      render(<ResetPassword />)
      
      expect(screen.getByRole('heading', { name: /Reset Password/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    test('renders return to login link', () => {
      render(<ResetPassword />)
      
      const loginLink = screen.getByText('Login');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('to', '/login');
    });
  });


  describe('Form Validation', () => {
    test('requires email field', async () => {
      render(<ResetPassword />)
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.submit(submitButton);
      
      const emailInput = screen.getByPlaceholderText('Email');
      expect(emailInput).toBeInvalid();
    });
  });


  describe('Form Submission', () => {
    test('handles successful password reset request', async () => {
      sendPasswordResetEmail.mockResolvedValueOnce();
      
      render(<ResetPassword />)
      
      //input to email form input
      const emailInput = screen.getByPlaceholderText('Email');
      await user.type(emailInput, 'test@example.com');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.submit(submitButton);

      //expect success
      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
        expect(mockAlert).toHaveBeenCalledWith('Email sent.');
      });
    });

    test('handles failed password reset request', async () => {
      const mockError = new Error('Cannot send email');
      sendPasswordResetEmail.mockRejectedValueOnce(mockError);
      
      render(<ResetPassword />);
      
      //input to email form input
      const emailInput = screen.getByPlaceholderText('Email');
      await user.type(emailInput, 'test@example.com');
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.submit(submitButton);

      //expect error
      const errorMessage = await screen.findByText('Cannot send email');
      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'test@example.com');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });


  describe('Input Handling', () => {
    test('updates email state on input change', async () => {
      render(<ResetPassword />);
      
      const emailInput = screen.getByPlaceholderText('Email');
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });
  });
});