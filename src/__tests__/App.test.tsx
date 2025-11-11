// Frontend App Component Tests
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the Google OAuth Provider
vi.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock environment variables
vi.mock('import.meta', () => ({
    env: {
        VITE_GOOGLE_CLIENT_ID: 'test-client-id',
    },
}));

describe('App Component', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        // Set required env var
        import.meta.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id';
    });

    test('renders without crashing', () => {
        const { container } = render(<App />);
        expect(container).toBeTruthy();
    });

    test('renders homepage when not authenticated', () => {
        render(<App />);
        
        // Check for main heading or key text
        const heading = screen.queryByText(/Elevate Your Professional Journey/i) || 
                       screen.queryByText(/Careerion/i);
        expect(heading).toBeTruthy();
    });

    test('shows authentication buttons when not authenticated', () => {
        render(<App />);
        
        // Check for sign up or log in buttons
        const signupButton = screen.queryByText(/Sign up/i);
        const loginButton = screen.queryByText(/Log in/i);
        
        expect(signupButton || loginButton).toBeTruthy();
    });

    test('displays navigation bar', () => {
        render(<App />);
        
        // Check for navigation element or buttons
        const signupButton = screen.queryByText(/Sign up/i);
        const loginButton = screen.queryByText(/Log in/i);
        
        // Navigation should have at least one of these elements
        expect(signupButton || loginButton).toBeTruthy();
    });

    test('handles dark mode correctly', () => {
        render(<App />);
        
        const html = document.documentElement;
        expect(html.classList.contains('dark')).toBe(true);
    });
});
