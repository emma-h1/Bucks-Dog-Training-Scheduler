import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { auth } from '../firebase';
import Navbar from '../Navbar';

// Mock the modules and dependencies
jest.mock('../firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
    signOut: jest.fn(() => Promise.resolve())
  }
}));

jest.mock('../assets/logoNoText.png', () => 'logo-mock');
jest.mock('../assets/userIcon.png', () => 'icon-mock');

jest.mock('react-bootstrap/Dropdown', () => {
  const DropdownToggle = ({ children, className }) => (
    <button className={className} data-testid="dropdown-toggle">{children}</button>
  );
  
  const DropdownItem = ({ children, onClick, href }) => (
    <a 
      href={href} 
      onClick={onClick} 
      data-testid={`dropdown-item-${children.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {children}
    </a>
  );
  
  const DropdownMenu = ({ children }) => (
    <div data-testid="dropdown-menu">{children}</div>
  );
  
  const Dropdown = ({ children }) => (
    <div data-testid="dropdown">{children}</div>
  );
  
  Dropdown.Toggle = DropdownToggle;
  Dropdown.Item = DropdownItem;
  Dropdown.Menu = DropdownMenu;
  
  return Dropdown;
});

// Helper function to render the component with Router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders navbar with navigation links', () => {
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });

    renderWithRouter(<Navbar />);
    
    // Basic navigation links should be visible
    expect(screen.getByText('HOME')).toBeInTheDocument();
    expect(screen.getByText('ABOUT')).toBeInTheDocument();
    expect(screen.getByText('SERVICES')).toBeInTheDocument();
    expect(screen.getByText('OUR TEAM')).toBeInTheDocument();
    expect(screen.getByText('CONTACT')).toBeInTheDocument();
    
    // Sign in button should be visible when not logged in
    expect(screen.getByText('SIGN IN')).toBeInTheDocument();
  });

  test('renders user dropdown when user is logged in', () => {
    const mockUser = {
      email: 'test@example.com'
    };
    
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    renderWithRouter(<Navbar />);
    
    // User email should be displayed in dropdown toggle
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    
    // APPOINTMENTS link should be visible for logged in users
    expect(screen.getByText('APPOINTMENTS')).toBeInTheDocument();
    
    // Admin dashboard should NOT be visible for regular users
    expect(screen.queryByText('ADMIN DASHBOARD')).not.toBeInTheDocument();
  });

  test('renders admin dashboard link for admin user', () => {
    const mockAdminUser = {
      email: 'wgrimmer15@gmail.com'
    };
    
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockAdminUser);
      return jest.fn();
    });

    renderWithRouter(<Navbar />);
    
    // Admin dashboard should be visible for admin user
    expect(screen.getByText('ADMIN DASHBOARD')).toBeInTheDocument();
  });

  test('CustomLink renders with active class when path matches', () => {
    // Mock the window.location to simulate being on the root path
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/'
      },
      writable: true
    });

    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });

    renderWithRouter(<Navbar />);
    
    // The HOME link should have the active class
    const homeListItem = screen.getByText('HOME').closest('li');
    expect(homeListItem).toHaveClass('active');
    
    // Other links should not have active class
    const aboutListItem = screen.getByText('ABOUT').closest('li');
    expect(aboutListItem).not.toHaveClass('active');
  });

  test('unsubscribes from auth listener on unmount', () => {
    const unsubscribeMock = jest.fn();
    auth.onAuthStateChanged.mockImplementation(() => unsubscribeMock);

    const { unmount } = renderWithRouter(<Navbar />);
    unmount();
    
    // Ensure unsubscribe was called
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  test('sign out functionality works correctly', async () => {
    const mockUser = {
      email: 'test@email.com'
    };
    
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser);
      return jest.fn();
    });

    auth.signOut.mockReturnValue(Promise.resolve());
  
    // Mock window.location.reload
    const originalReload = window.location.reload;
    window.location.reload = jest.fn();
  
    renderWithRouter(<Navbar />);
    
    // Find and click the dropdown toggle to open the menu
    const dropdownToggle = screen.getByTestId('dropdown-toggle');
    fireEvent.click(dropdownToggle);
    
    // Click the logout option
    fireEvent.click(screen.getByTestId('dropdown-item-logout'));
    
    // Verify signOut was called
    expect(auth.signOut).toHaveBeenCalled();
    
    // We need to wait for the Promise to resolve
    await Promise.resolve();
    
    // Verify reload was called
    expect(window.location.reload).toHaveBeenCalled();
    
    // Restore original reload function
    window.location.reload = originalReload;
  });
});