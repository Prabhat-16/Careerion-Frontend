// Frontend App Component Tests
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the Google OAuth Provider
jest.mock('@react-oauth/google', () => ({
    GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('App Component', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    test('renders without crashing', () => {
        render(<App />);
    });

    test('renders homepage when not authenticated', () => {
        render(<App />);
        
        expect(screen.getByText(/Elevate Your Professional Journey/i)).toBeInTheDocument();
    });

    test('shows login and signup buttons when not authenticated', () => {
        render(<App />);
        
        expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
        expect(screen.getByText(/Log in/i)).toBeInTheDocument();
    });

    test('renders Career Coach section', () => {
        render(<App />);
        
        expect(screen.getByText(/Career Coach/i)).toBeInTheDocument();
    });

    test('displays navigation bar', () => {
        render(<App />);
        
        expect(screen.getByText(/Careerion/i)).toBeInTheDocument();
    });

    test('handles dark mode correctly', () => {
        render(<App />);
        
        const html = document.documentElement;
        expect(html.classList.contains('dark')).toBe(true);
    });
});
