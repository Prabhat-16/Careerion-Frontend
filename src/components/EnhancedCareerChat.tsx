import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  category?: string;
}

interface EnhancedCareerChatProps {
  className?: string;
}

const EnhancedCareerChat: React.FC<EnhancedCareerChatProps> = ({ className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const careerCategories = [
    { id: 'general', label: 'General Career Guidance', icon: '🎯' },
    { id: 'skills', label: 'Skills Development', icon: '📚' },
    { id: 'transition', label: 'Career Transition', icon: '🔄' },
    { id: 'interview', label: 'Interview Preparation', icon: '💼' },
    { id: 'salary', label: 'Salary & Negotiation', icon: '💰' },
    { id: 'networking', label: 'Professional Networking', icon: '🤝' },
    { id: 'industry', label: 'Industry Insights', icon: '🏢' },
    { id: 'education', label: 'Education & Certifications', icon: '🎓' }
  ];

  useEffect(() => {
    if (messages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getEnhancedCareerResponse = async (userMessage: string, category: string = '') => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Use the enhanced career recommendations endpoint if user is authenticated
      if (token) {
        const response = await axios.post(
          `${API_URL}/career-recommendations`,
          {
            query: userMessage,
            category: category || selectedCategory
          },
          { headers }
        );

        const aiMessage: Message = {
          sender: 'ai',
          text: response.data.response,
          timestamp: new Date(),
          category: response.data.category
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Fall back to regular chat endpoint for non-authenticated users
        const history = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        const response = await axios.post(`${API_URL}/chat`, {
          history,
          message: userMessage,
          systemPrompt: `You are Careerion AI, providing comprehensive career guidance. 
          Focus on: ${category || selectedCategory || 'general career advice'}.
          Provide detailed, actionable advice with specific steps, resources, and recommendations.
          Make your response comprehensive (minimum 500 words) and highly valuable.`
        });

        const aiMessage: Message = {
          sender: 'ai',
          text: response.data.response,
          timestamp: new Date(),
          category: category || selectedCategory
        };

        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err: any) {
      console.error('Error getting career response:', err);
      setError(
        err.response?.data?.error || 
        'Sorry, I encountered an issue. Please try again or rephrase your question.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date(),
      category: selectedCategory
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }

    await getEnhancedCareerResponse(messageText);
  };

  const handleQuickStart = async (category: string, question: string) => {
    setSelectedCategory(category);
    
    const userMessage: Message = {
      sender: 'user',
      text: question,
      timestamp: new Date(),
      category
    };

    setMessages([userMessage]);
    await getEnhancedCareerResponse(question, category);
  };

  const quickStartQuestions = [
    {
      category: 'general',
      question: 'I need comprehensive career guidance. Can you help me explore my options and create a career development plan?',
      title: 'Complete Career Assessment'
    },
    {
      category: 'skills',
      question: 'What are the most in-demand skills in 2024, and how can I develop them to advance my career?',
      title: 'Skills Development Roadmap'
    },
    {
      category: 'transition',
      question: 'I want to change careers but don\'t know where to start. Can you provide a detailed transition strategy?',
      title: 'Career Change Strategy'
    },
    {
      category: 'salary',
      question: 'How can I research salary ranges for my role and negotiate better compensation?',
      title: 'Salary Optimization Guide'
    }
  ];

  const formatMessage = (text: string) => {
    // Enhanced text formatting for better readability
    return text
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.trim() === '') return null;
        
        // Check if it's a header (starts with ##, ###, etc.)
        if (paragraph.match(/^#{1,3}\s/)) {
          const level = paragraph.match(/^(#{1,3})/)?.[1].length || 1;
          const text = paragraph.replace(/^#{1,3}\s/, '');
          const className = level === 1 ? 'text-lg font-bold mt-4 mb-2' : 
                          level === 2 ? 'text-base font-semibold mt-3 mb-2' : 
                          'text-sm font-medium mt-2 mb-1';
          return (
            <div key={index} className={className}>
              {text}
            </div>
          );
        }
        
        // Check if it's a bullet point
        if (paragraph.match(/^[-*•]\s/)) {
          return (
            <div key={index} className="ml-4 mb-1">
              <span className="text-indigo-400 mr-2">•</span>
              {paragraph.replace(/^[-*•]\s/, '')}
            </div>
          );
        }
        
        // Check if it's a numbered list
        if (paragraph.match(/^\d+\.\s/)) {
          return (
            <div key={index} className="ml-4 mb-1">
              {paragraph}
            </div>
          );
        }
        
        // Regular paragraph
        return (
          <div key={index} className="mb-3 leading-relaxed">
            {paragraph}
          </div>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/20">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          Enhanced Career Coach
        </h2>
        <div className="flex flex-wrap gap-2">
          {careerCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/20 text-slate-700 dark:text-gray-300 hover:bg-white/30'
              }`}
            >
              {category.icon} {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center text-slate-600 dark:text-gray-400 mb-6">
              <h3 className="text-lg font-semibold mb-2">Get Comprehensive Career Guidance</h3>
              <p className="text-sm">Choose a quick start option or ask any career-related question</p>
            </div>
            
            <div className="grid gap-3">
              {quickStartQuestions.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickStart(item.category, item.question)}
                  className="p-4 text-left rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
                >
                  <div className="font-medium text-slate-800 dark:text-white mb-1">
                    {item.title}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-gray-400 line-clamp-2">
                    {item.question}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-1">
                    AI
                  </div>
                )}
                <div
                  className={`px-4 py-3 rounded-xl min-w-0 flex-1 max-w-[calc(100%-3rem)] ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white ml-8'
                      : 'glass-card text-slate-800 dark:text-white'
                  }`}
                >
                  {message.sender === 'ai' ? (
                    <div className="space-y-2">
                      {formatMessage(message.text)}
                      {message.category && (
                        <div className="text-xs text-slate-500 dark:text-gray-400 mt-3 pt-2 border-t border-white/20">
                          Category: {careerCategories.find(c => c.id === message.category)?.label}
                        </div>
                      )}
                    </div>
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  AI
                </div>
                <div className="glass-card px-4 py-3 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-sm text-slate-600 dark:text-gray-400 ml-2">
                      Generating comprehensive career guidance...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-center text-red-500 dark:text-red-400 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}
          </>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-white/20">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-resize textarea
              const textarea = e.target;
              textarea.style.height = 'auto';
              textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
            }}
            onKeyPress={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask me anything about your career... (Shift+Enter for new line)"
            className="glass-input flex-1 py-3 px-4 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 rounded-xl resize-none min-h-[48px] max-h-[120px] overflow-y-auto leading-6"
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || input.trim() === ''}
            className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-110 disabled:scale-100 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        
        {selectedCategory && (
          <div className="mt-2 text-xs text-slate-600 dark:text-gray-400">
            Focus: {careerCategories.find(c => c.id === selectedCategory)?.label}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCareerChat;