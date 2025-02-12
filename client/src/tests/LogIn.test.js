import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import LogIn from '../pages/LogIn';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, getIdToken } from 'firebase/auth';

//mock firebase
jest.mock('../firebase', () => ({
    auth: {}
  }));

//mock Firebase auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  setPersistence: jest.fn(() => Promise.resolve()),
  browserLocalPersistence: jest.fn(),
  getIdToken: jest.fn(() => Promise.resolve('mock-id-token')),
}));


describe('LogIn Component', () => {

  beforeEach(() => {
    // clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders LogIn component', () => {
    render(<LogIn />);

    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    expect(screen.getByText('Don\'t have an account?')).toBeInTheDocument();
  });

  test('handles input changes', () => {
    render(<LogIn />);

    //get form inputs
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');

    //input values
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('handles successful login', async () => {
    //mock Firebase to resolve successfully
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'mock-uid' } });

    //mock fetch to resolve successfully
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(<LogIn />);

    // get inputs
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { type: 'submit' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    //expect success
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });



  });

  test('displays error when login fails', async () => {
    //mock Firebase to reject with an error
    const errorMessage = 'Firebase: Error (auth/invalid-credentials).';
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error(errorMessage));

    render(<LogIn />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Log In' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    const error = await screen.findByText(errorMessage);
    expect(error).toBeInTheDocument();
  });

  
});