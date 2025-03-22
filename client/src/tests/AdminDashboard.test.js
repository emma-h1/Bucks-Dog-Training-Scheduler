import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';

const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('AdminDashboard Component', () => {
  test('renders dashboard title', () => {
    renderWithRouter(<AdminDashboard />);
    const titleElement = screen.getByText(/Admin Dashboard/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('renders all navigation cards', () => {
    renderWithRouter(<AdminDashboard />);
    
    // Check for all card titles
    const appointmentsCard = screen.getByText(/Manage Appointments/i);
    const servicesCard = screen.getByText(/Manage Services/i);
    const usersCard = screen.getByText(/Manage Users/i);
    const trainersCard = screen.getByText(/Manage Trainers/i);
    
    expect(appointmentsCard).toBeInTheDocument();
    expect(servicesCard).toBeInTheDocument();
    expect(usersCard).toBeInTheDocument();
    expect(trainersCard).toBeInTheDocument();
  });

  test('navigation cards have correct links', () => {
    renderWithRouter(<AdminDashboard />);
    
    // Check if links have correct hrefs
    const appointmentsLink = screen.getByText(/Manage Appointments/i).closest('a');
    const servicesLink = screen.getByText(/Manage Services/i).closest('a');
    const usersLink = screen.getByText(/Manage Users/i).closest('a');
    const trainersLink = screen.getByText(/Manage Trainers/i).closest('a');
    
    expect(appointmentsLink).toHaveAttribute('href', '/manage-appointments');
    expect(servicesLink).toHaveAttribute('href', '/manage-services');
    expect(usersLink).toHaveAttribute('href', '/manage-users');
    expect(trainersLink).toHaveAttribute('href', '/manage-trainers');
  });

  test('renders SVG icons for each card', () => {
    renderWithRouter(<AdminDashboard />);
    
    // Check for SVG elements
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBe(4); // One SVG for each card
  });
});