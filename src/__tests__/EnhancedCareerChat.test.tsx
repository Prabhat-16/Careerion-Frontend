// Enhanced Career Chat Component Tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import EnhancedCareerChat from '../components/EnhancedCareerChat';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('EnhancedCareerChat Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('renders chat interface', () => {
        render(<EnhancedCareerChat />);
        
        expect(screen.getByText(/Enhanced Career Coach/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Ask me anything about your career/i)).toBeInTheDocument();
    });

    test('displays category filters', () => {
        render(<EnhancedCareerChat />);
        
        expect(screen.getByText(/General Career Guidance/i)).toBeInTheDocument();
        expect(screen.getByText(/Skills Development/i)).toBeInTheDocument();
        expect(screen.getByText(/Career Transition/i)).toBeInTheDocument();
    });

    test('displays quick start questions', () => {
        render(<EnhancedCareerChat />);
        
        expect(screen.getByText(/Complete Career Assessment/i)).toBeInTheDocument();
        expect(screen.getByText(/Skills Development Roadmap/i)).toBeInTheDocument();
    });

    test('handles category selection', () => {
        render(<EnhancedCareerChat />);
        
        const categoryButton = screen.getByText(/Skills Development/i);
        fireEvent.click(categoryButton);
        
        // Category should be highlighted
        expect(categoryButton.closest('button')).toHaveClass('bg-indigo-600');
    });

    test('sends message on button click', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                response: 'This is a career guidance response',
                modelUsed: 'gemini-2.0-flash'
            }
        });

        render(<EnhancedCareerChat />);
        
        const input = screen.getByPlaceholderText(/Ask me anything about your career/i);
        const sendButton = screen.getByRole('button', { name: /send/i });
        
        fireEvent.change(input, { target: { value: 'What career should I choose?' } });
        fireEvent.click(sendButton);
        
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/chat'),
                expect.objectContaining({
                    message: 'What career should I choose?'
                }),
                expect.any(Object)
            );
        });
    });

    test('displays AI response', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: {
                response: 'Here is your career guidance',
                modelUsed: 'gemini-2.0-flash'
            }
        });

        render(<EnhancedCareerChat />);
        
        const input = screen.getByPlaceholderText(/Ask me anything about your career/i);
        fireEvent.change(input, { target: { value: 'Career advice' } });
        fireEvent.submit(input.closest('form')!);
        
        await waitFor(() => {
            expect(screen.getByText(/Here is your career guidance/i)).toBeInTheDocument();
        });
    });

    test('shows loading indicator while waiting for response', async () => {
        mockedAxios.post.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => resolve({ data: { response: 'Response' } }), 1000))
        );

        render(<EnhancedCareerChat />);
        
        const input = screen.getByPlaceholderText(/Ask me anything about your career/i);
        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.submit(input.closest('form')!);
        
        await waitFor(() => {
            expect(screen.getByText(/Generating comprehensive career guidance/i)).toBeInTheDocument();
        });
    });

    test('handles error gracefully', async () => {
        mockedAxios.post.mockRejectedValueOnce({
            response: { data: { error: 'API Error' } }
        });

        render(<EnhancedCareerChat />);
        
        const input = screen.getByPlaceholderText(/Ask me anything about your career/i);
        fireEvent.change(input, { target: { value: 'Test' } });
        fireEvent.submit(input.closest('form')!);
        
        await waitFor(() => {
            expect(screen.getByText(/API Error/i)).toBeInTheDocument();
        });
    });

    test('clears input after sending message', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { response: 'Response' }
        });

        render(<EnhancedCareerChat />);
        
        const input = screen.getByPlaceholderText(/Ask me anything about your career/i) as HTMLTextAreaElement;
        fireEvent.change(input, { target: { value: 'Test message' } });
        fireEvent.submit(input.closest('form')!);
        
        await waitFor(() => {
            expect(input.value).toBe('');
        });
    });

    test('handles quick start question click', async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { response: 'Career assessment response' }
        });

        render(<EnhancedCareerChat />);
        
        const quickStartButton = screen.getByText(/Complete Career Assessment/i);
        fireEvent.click(quickStartButton);
        
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalled();
        });
    });

    test('uses enhanced endpoint when authenticated', async () => {
        localStorage.setItem('adminToken', 'test-token');
        
        mockedAxios.post.mockResolvedValueOnce({
            data: { response: 'Enhanced response', category: 'general' }
        });

        render(<EnhancedCareerChat />);
        
        const input = screen.getByPlaceholderText(/Ask me anything about your career/i);
        fireEvent.change(input, { target: { value: 'Career advice' } });
        fireEvent.submit(input.closest('form')!);
        
        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('/career-recommendations'),
                expect.any(Object),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-token'
                    })
                })
            );
        });
    });
});
