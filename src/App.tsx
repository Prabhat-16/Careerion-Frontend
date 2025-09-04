import { useState, useEffect, useRef, createContext, useContext } from 'react';
import type { FC, ReactNode } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import './index.css';

declare global {
  interface Window {
    google: any;
  }
}

// Extend the Window interface to include gapi
declare const gapi: any;

// --- API Configuration ---
const API_URL = 'http://localhost:5001/api';

// --- TypeScript Interfaces ---
interface Message {
    sender: 'user' | 'ai';
    text: string;
}
interface User {
    _id: string;
    name: string;
    email: string;
}
interface VideoBackgroundProps {
    theme: string;
}
interface CareerRecommendation {
    title: string;
    description: string;
    key_skills: string[];
}
interface ProfileFormData {
    skills: string;
    interests: string;
}

// --- Context for Global State Management ---
interface AppContextType {
    theme: string;
    currentUser: User | null;
    isLoadingAuth: boolean;
    toggleTheme: () => void;
    openModal: (mode: 'login' | 'signup') => void;
    logout: () => void;
    login: (user: User, token: string) => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

// --- SVG Icons ---
interface IconProps {
  className?: string;
}

const GoogleIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg className={`w-5 h-5 mr-3 ${className}`} viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.486-11.181-8.207l-6.571,4.819C9.656,39.663,16.318,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.978,36.218,44,30.608,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg> 
);
const LogoIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg className={className} width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" className="stop-color-light dark:stop-color-dark-start" />
        <stop offset="100%" className="stop-color-dark dark:stop-color-dark-end" />
      </linearGradient>
    </defs>
    <path d="M20 80 Q 50 80, 50 50" fill="none" className="stroke-light dark:stroke-dark-start" strokeWidth="12" strokeLinecap="round"/>
    <path d="M50 50 Q 50 20, 80 20" fill="none" stroke="url(#grad3)" strokeWidth="12" strokeLinecap="round"/>
  </svg> 
);
const SparklesIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.22 5.22a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM13.66 6.34a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm14.25.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zm-6.03 4.47a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm1.06-1.06a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18z" clipRule="evenodd" />
  </svg> 
);
const BriefcaseIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v1H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zm-1 2V4a1 1 0 112 0v1H9z" clipRule="evenodd" />
  </svg> 
);
const ChatBubbleLeftRightIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 mr-2 ${className}`}>
    <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.89-6.08 2.418a.75.75 0 00.96 1.144A7.49 7.49 0 0110 3.5c1.554 0 2.999.462 4.242 1.238a.75.75 0 00.96-1.144A8.962 8.962 0 0010 2zM3.92 15.582A8.962 8.962 0 0010 18c2.236 0 4.43-.89 6.08-2.418a.75.75 0 00-.96-1.144A7.49 7.49 0 0110 16.5c-1.554 0-2.999-.462-4.242-1.238a.75.75 0 00-.96 1.144z" clipRule="evenodd" />
    <path d="M2.122 7.034a.75.75 0 001.038-.283A7.465 7.465 0 0110 5.5c1.843 0 3.543.64 4.84 1.751a.75.75 0 001.038.283c.32-.244.4-.698.156-1.018A8.962 8.962 0 0010 4c-2.54 0-4.857.996-6.634 2.618a.75.75 0 00.756 1.416zM2.122 12.966a.75.75 0 00-.756-1.416A8.962 8.962 0 0010 16c2.54 0 4.857-.996-6.634-2.618a.75.75 0 00-.756-1.416.75.75 0 00-1.038.283A7.465 7.465 0 0110 14.5c-1.843 0-3.543-.64-4.84-1.751a.75.75 0 00-1.038.283z" />
  </svg> 
);
const SendIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
  </svg> 
);
const SunIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
  </svg> 
);
const MoonIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg> 
);
const ArrowLeftIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg> 
);
const TypingIndicator: FC = () => ( <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div><div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div><div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div></div> );

// --- Reusable Components ---
const VideoBackground: FC<VideoBackgroundProps> = ({ theme }) => ( <div className={`absolute top-0 left-0 w-full h-full -z-10 transition-all duration-500 ${ theme === 'light' ? 'bg-gradient-to-br from-slate-50 to-white' : 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' }`}></div> );
const Navbar: FC = () => { const { theme, toggleTheme, currentUser, logout, openModal } = useAppContext(); return ( <nav className={`w-full p-4 flex justify-between items-center mb-4 ${theme === 'light' ? 'glass-effect' : 'dark-glass-effect'}`}><div className="flex items-center space-x-3"><LogoIcon /><h1 className="text-2xl font-bold tracking-wide text-slate-800 dark:text-white"><span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">C</span>areerion</h1></div><div className="flex items-center space-x-2 sm:space-x-4"><button onClick={toggleTheme} className="p-2 rounded-full text-slate-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">{theme === 'light' ? <MoonIcon /> : <SunIcon />}</button>{currentUser ? ( <><span className="text-sm text-slate-700 dark:text-gray-300">Welcome, {currentUser.name.split(' ')[0]}</span><button onClick={logout} className="px-5 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors">Log out</button></> ) : ( <><button onClick={() => openModal('signup')} className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold border border-indigo-500 hover:bg-indigo-700 transition-colors">Sign up</button><button onClick={() => openModal('login')} className="px-5 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors">Log in</button></> )}</div></nav> ); };
const MainContent: FC = () => {
  const { theme } = useAppContext();
  const [isThinking, setIsThinking] = useState(true);
  const [recommendation, setRecommendation] = useState('');
  const recommendations = [
    'AI Ethicist',
    'Quantum Computing Scientist',
    'Bio-Integration Specialist',
    'Neural Interface Designer',
    'Fusion Energy Technician'
  ];

  useEffect(() => {
    // Simulate AI thinking and recommending
    const interval = setInterval(() => {
      setIsThinking(true);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * recommendations.length);
        setRecommendation(recommendations[randomIndex]);
        setIsThinking(false);
      }, 1500);
      
    }, 5000);
    
     setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * recommendations.length);
        setRecommendation(recommendations[randomIndex]);
        setIsThinking(false);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full lg:w-1/2 p-4 flex flex-col min-h-0">
      <div className="flex flex-col items-center pt-8 pb-8 -mt-4">
        {/* Video Container with Glass Effect - Extra Large */}
        <div className="relative w-full max-w-[480px] mx-auto mb-4 rounded-2xl overflow-hidden glass-panel">
          <div className="relative z-10 p-2 rounded-2xl overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-auto rounded-xl shadow-2xl"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(99, 102, 241, 0.5))',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <source src="/videos/Robot.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {/* Enhanced glass overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/15 backdrop-blur-sm rounded-2xl pointer-events-none" />
        </div>

        {/* Text Content - Closer to robot */}
        <div className="text-center z-10 mt-4">
          <h1 
            className="text-3xl sm:text-4xl font-bold leading-tight" 
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              color: theme === 'light' ? 'rgba(79, 70, 229, 0.95)' : 'white',
              marginBottom: '0.5rem',
              lineHeight: '1.2'
            }}
          >
            Elevate Your Professional Journey
          </h1>
          <h2 
            className="text-2xl sm:text-3xl font-bold mb-2" 
            style={{ 
              color: theme === 'light' ? 'rgba(99, 102, 241, 0.95)' : '#a5b4fc',
              lineHeight: '1.2',
              marginBottom: '0.75rem'
            }}
          >
            Strategic Career Development
          </h2>
          <p 
            className="text-base sm:text-lg text-slate-700 dark:text-gray-200 mt-2 px-4"
            style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.4',
              fontWeight: '500'
            }}
          >
            AI-powered career guidance for professionals
          </p>
        </div>
      </div>
    </div>
  );
};
const CareerCoach: FC = () => { 
  const { theme } = useAppContext(); 
  const [messages, setMessages] = useState<Message[]>([]); 
  const [input, setInput] = useState(''); 
  const [isChatting, setIsChatting] = useState(false); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const chatEndRef = useRef<HTMLDivElement>(null); 

  useEffect(() => { 
    if (isChatting) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [messages, isChatting]); 

  const handleBack = () => { 
    setIsChatting(false); 
    setMessages([]); 
    setError(null); 
  }; 

  const getAIResponse = async (userMessage: Message) => { 
    setIsLoading(true); 
    setError(null); 
    const history = messages.map(msg => ({ 
      role: msg.sender === 'user' ? 'user' : 'model', 
      parts: [{ text: msg.text }] 
    })); 
    try { 
      const res = await axios.post(`${API_URL}/chat`, { 
        history, 
        message: userMessage.text,
        systemPrompt: 'Please respond in plain text without using markdown formatting like asterisks or backticks.'
      }); 
      const cleanedResponse = cleanResponseText(res.data.response);
      setMessages(prev => [...prev, { sender: 'ai', text: cleanedResponse }]); 
    } catch (err) { 
      setError('Sorry, something went wrong. Please try again.'); 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    } 
  }; 

  const startConversation = (topic: string) => { 
    setIsChatting(true); 
    let userMessageText = ''; 
    switch(topic) { 
      case 'discover': 
        userMessageText = 'Help me discover my career path.'; 
        break; 
      case 'explore': 
        userMessageText = 'I want to explore some career fields.'; 
        break; 
      case 'chat': 
        userMessageText = 'I just want to chat.'; 
        break; 
      default: 
        return; 
    } 
    const userMessage: Message = { sender: 'user', text: userMessageText }; 
    setMessages([userMessage]); 
    getAIResponse(userMessage); 
  }; 

  const cleanResponseText = (text: string) => {
    if (!text) return '';
    // Remove markdown formatting (bold, italic, etc.)
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')      // Remove *italic*
      .replace(/```[\s\S]*?```/g, '')    // Remove code blocks
      .replace(/`(.*?)`/g, '$1')        // Remove `code`
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [links](url)
      .replace(/\n\s*\n/g, '\n')      // Remove extra newlines
      .trim();
  };

  const handleSendMessage = () => { 
    if (input.trim() === '' || isLoading) return; 
    if (!isChatting) setIsChatting(true); 
    const userMessage: Message = { sender: 'user', text: input }; 
    setMessages(prev => [...prev, userMessage]); 
    setInput(''); 
    getAIResponse(userMessage); 
  }; 

  return ( 
    <div className="w-full lg:w-1/2 p-6 flex items-center justify-center slide-in-right">
      <div className="glass-panel w-full max-w-md h-[70vh] flex flex-col rounded-2xl overflow-hidden border-2 border-indigo-300 dark:border-indigo-500 transition-colors">
        <div className="glass-panel-inner flex flex-col h-full">
          <div className="flex items-center justify-center relative p-4 border-b border-white/20 flex-shrink-0">
            {isChatting && (
              <button 
                onClick={handleBack} 
                className="absolute left-4 p-1.5 rounded-full text-slate-700 dark:text-gray-200 hover:bg-white/20 transition-colors"
              >
                <ArrowLeftIcon />
              </button>
            )}
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Career Coach</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4">
            {isChatting ? ( 
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                        AI
                      </div>
                    )}
                    <div 
                      className={`px-4 py-2.5 rounded-xl max-w-xs md:max-w-sm ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white' 
                          : 'glass-card text-slate-800 dark:text-white'
                      }`}
                    >
                      {msg.sender === 'ai' ? cleanResponseText(msg.text) : msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                      AI
                    </div>
                    <div className="glass-card px-4 py-2.5 rounded-xl">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
                {error && <div className="text-center text-red-500 dark:text-red-400 text-sm p-2">{error}</div>}
                <div ref={chatEndRef} />
              </div>
            ) : ( 
              <div className="space-y-4 p-2">
                <button 
                  onClick={() => startConversation('discover')} 
                  className="glass-btn w-full flex items-center justify-center text-left p-4 text-slate-800 dark:text-white hover:scale-[1.02] transition-transform"
                >
                  <SparklesIcon className="flex-shrink-0" />
                  <span className="ml-2">Discover My Career Path</span>
                </button>
                <button 
                  onClick={() => startConversation('explore')} 
                  className="glass-btn w-full flex items-center justify-center text-left p-4 text-slate-800 dark:text-white hover:scale-[1.02] transition-transform"
                >
                  <BriefcaseIcon className="flex-shrink-0" />
                  <span className="ml-2">Explore Career Fields</span>
                </button>
                <button 
                  onClick={() => startConversation('chat')} 
                  className="glass-btn w-full flex items-center justify-center text-left p-4 text-slate-800 dark:text-white hover:scale-[1.02] transition-transform"
                >
                  <ChatBubbleLeftRightIcon className="flex-shrink-0" />
                  <span className="ml-2">Chat with AI</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/20 flex-shrink-0">
            <div className="relative">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()} 
                placeholder={isChatting ? "Type your message..." : "Or ask anything about your career..."} 
                className="glass-input w-full pr-12 py-3 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 rounded-xl" 
                disabled={isLoading} 
              />
              <button 
                onClick={handleSendMessage} 
                disabled={isLoading || input.trim() === ''} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all transform hover:scale-110 disabled:scale-100"
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
};

// --- Page and Dashboard Components ---
const RecommendationsDisplay: FC<{ recommendations: CareerRecommendation[] }> = ({ recommendations }) => { const { theme } = useAppContext(); return ( <div className="w-full max-w-4xl mx-auto"><h2 className="text-3xl font-bold glass-text mb-8">Here are your recommended career paths:</h2><div className="grid md:grid-cols-3 gap-6">{recommendations.map((rec, index) => ( <div key={index} className={`p-6 rounded-2xl ${theme === 'light' ? 'glass-effect' : 'dark-glass-effect'}`}><h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{rec.title}</h3><p className="text-slate-600 dark:text-gray-300 text-sm mb-4">{rec.description}</p><h4 className="font-semibold text-slate-700 dark:text-gray-200 mb-2 text-sm">Key Skills:</h4><ul className="list-disc list-inside text-sm text-slate-600 dark:text-gray-300">{rec.key_skills.map((skill, i) => <li key={i}>{skill}</li>)}</ul></div> ))}</div></div> ); };
const FollowUpChat: FC<{ initialHistory: Message[] }> = ({ initialHistory }) => { const { theme } = useAppContext(); const [messages, setMessages] = useState<Message[]>(initialHistory); const [input, setInput] = useState(''); const [isLoading, setIsLoading] = useState(false); const handleSendMessage = async () => { if (input.trim() === '' || isLoading) return; const userMessage: Message = { sender: 'user', text: input }; const newMessages = [...messages, userMessage]; setMessages(newMessages); setInput(''); setIsLoading(true); const history = newMessages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] })); try { const res = await axios.post(`${API_URL}/chat`, { history, message: input }); setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]); } catch (error) { console.error(error); setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I ran into an error." }]); } finally { setIsLoading(false); } }; return ( <div className="w-full max-w-4xl mx-auto mt-12"><h2 className="text-3xl font-bold glass-text mb-8 text-center">Have more questions?</h2><div className={`p-4 rounded-2xl ${theme === 'light' ? 'glass-effect' : 'dark-glass-effect'}`}><div className="relative"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about these careers..." className="glass-input pr-12 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400" disabled={isLoading} /><button onClick={handleSendMessage} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-800 transition-colors"><SendIcon /></button></div></div></div> ); };
const ProfileForm: FC<{ onGetRecommendations: (data: ProfileFormData) => void, isLoading: boolean }> = ({ onGetRecommendations, isLoading }) => { const { theme } = useAppContext(); const [formData, setFormData] = useState<ProfileFormData>({ skills: '', interests: '' }); const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setFormData({ ...formData, [e.target.name]: e.target.value }); }; const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onGetRecommendations(formData); }; return ( <div className={`p-8 md:p-12 rounded-2xl ${theme === 'light' ? 'glass-effect' : 'dark-glass-effect'} max-w-2xl mx-auto`}><h2 className="text-3xl font-bold glass-text mb-2">Find Your Career Path</h2><p className="text-slate-600 dark:text-gray-300 mb-8">Tell us about yourself, and our AI will suggest careers tailored to you.</p><form onSubmit={handleSubmit} className="space-y-6"><div><label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Your Skills</label><textarea name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., Python, React, Public Speaking, Project Management" className="glass-input min-h-[100px] text-slate-800 dark:text-white" required /></div><div><label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Your Interests</label><textarea name="interests" value={formData.interests} onChange={handleChange} placeholder="e.g., Technology, Healthcare, Art, Finance, Renewable Energy" className="glass-input min-h-[100px] text-slate-800 dark:text-white" required /></div><button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50">{isLoading ? 'Analyzing...' : 'Find My Career Path'}</button></form></div> ); };
const DashboardPage: FC = () => { const [recommendations, setRecommendations] = useState<CareerRecommendation[] | null>(null); const [initialHistory, setInitialHistory] = useState<Message[]>([]); const [isLoading, setIsLoading] = useState(false); const [error, setError] = useState<string | null>(null); const handleGetRecommendations = async (profileData: ProfileFormData) => { setIsLoading(true); setError(null); const prompt = `Based on the following user profile, recommend 3 career paths. For each path, provide a "title", a "description", and an array of 3 "key_skills". Format the response as a clean JSON array of objects. Do not include any other text or markdown formatting.\nUser Profile:\n- Skills: ${profileData.skills}\n- Interests: ${profileData.interests}`; const historyForChat: Message[] = [{ sender: 'user', text: `Here is my profile for career recommendations:\nSkills: ${profileData.skills}\nInterests: ${profileData.interests}` }]; try { const res = await axios.post(`${API_URL}/chat`, { message: prompt }); const cleanedResponse = res.data.response.replace(/```json/g, '').replace(/```/g, '').trim(); const parsedRecommendations = JSON.parse(cleanedResponse); setRecommendations(parsedRecommendations); historyForChat.push({ sender: 'ai', text: `Based on your profile, here are some recommendations: ${JSON.stringify(parsedRecommendations, null, 2)}`}); setInitialHistory(historyForChat); } catch (err) { console.error("Error parsing AI response:", err); setError("Sorry, we couldn't get recommendations. The AI response might have been in an unexpected format. Please try rephrasing your skills and interests."); } finally { setIsLoading(false); } }; return ( <main className="container mx-auto px-6 py-12 text-center">{!recommendations ? ( <ProfileForm onGetRecommendations={handleGetRecommendations} isLoading={isLoading} /> ) : ( <> <RecommendationsDisplay recommendations={recommendations} /> <FollowUpChat initialHistory={initialHistory} /> </> )}{error && <p className="text-red-500 mt-4">{error}</p>}</main> ); };
const HomePage: FC = () => { return ( <main className="flex flex-col lg:flex-row container mx-auto px-6 pb-12"><MainContent /><CareerCoach /></main> ); };
const AppLayout: FC = () => { return ( <div className="relative z-10"><Navbar /><Outlet /></div> ); };

const ProtectedRoute: FC = () => {
    const { currentUser, isLoadingAuth } = useAppContext();
    if (isLoadingAuth) {
        return ( <div className="w-full text-center p-20"><h2 className="text-2xl font-bold glass-text">Loading...</h2></div> );
    }
    if (!currentUser) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
};

interface AuthModalProps { isOpen: boolean; onClose: () => void; initialMode: 'login' | 'signup'; }
const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, initialMode }) => { 
  const { theme, login } = useAppContext(); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '' }); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleGoogleSignIn = useGoogleLogin({ 
    onSuccess: async (tokenResponse) => { 
      try { 
        setIsLoading(true); 
        const res = await axios.post(`${API_URL}/auth/google`, { 
          token: tokenResponse.access_token, 
        }); 
        login(res.data.user, res.data.token); 
        onClose(); 
      } catch (err) { 
        setError('Google Sign-In failed. Please try again.'); 
        console.error(err); 
      } finally { 
        setIsLoading(false); 
      } 
    }, 
    onError: () => { 
      setError('Google Sign-In failed. Please try again.'); 
    } 
  }); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
    setError(null); 
  }; 

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setIsLoading(true); 
    setError(null); 
    const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login'; 
    try { 
      const response = await axios.post<{ user: User, token: string }>(`${API_URL}${endpoint}`, formData); 
      login(response.data.user, response.data.token); 
      onClose(); 
    } catch (err: any) { 
      setError(err.response?.data?.error || 'An unexpected error occurred.'); 
    } finally { 
      setIsLoading(false); 
    } 
  }; 

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'login' 
              ? 'Sign in to continue to Careerion' 
              : 'Create your Careerion account'}
          </p>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <div className="mt-1 form-field" style={{ '--delay': 1 } as React.CSSProperties}>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="mt-1 form-field" style={{ '--delay': 2 } as React.CSSProperties}>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    onClick={() => {
                      // TODO: Implement forgot password functionality
                      setError('Password reset functionality coming soon!');
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="mt-1 form-field" style={{ '--delay': 3 } as React.CSSProperties}>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                  required
                  minLength={6}
                />
              </div>
            </div>
            
            {error && (
              <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 btn-primary"
              style={{ '--delay': 4 } as React.CSSProperties}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoogleSignIn();
                }}
                className="btn-google"
              >
                <GoogleIcon className="h-5 w-5" />
                <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
              {mode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setMode('signup')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button 
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- The App Provider (Manages all state) ---
const AppProvider: FC<{ children: ReactNode }> = ({ children }) => { 
  const [theme, setTheme] = useState<string>('dark'); 
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login'); 
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); 
  const navigate = useNavigate(); 
  
  useEffect(() => { 
    document.documentElement.classList.toggle('dark', theme === 'dark'); 
  }, [theme]); 
  
  useEffect(() => { 
    const storedUser = localStorage.getItem('user'); 
    if (storedUser) { 
      try {
        setCurrentUser(JSON.parse(storedUser)); 
      } catch (e) {
        console.error('Error parsing user data from localStorage', e);
        localStorage.removeItem('user');
      }
    } 
    setIsLoadingAuth(false); 
  }, []); 
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }; 
  
  const openModal = (mode: 'login' | 'signup') => { 
    setAuthMode(mode); 
    setIsModalOpen(true); 
  }; 
  
  const closeModal = () => setIsModalOpen(false); 
  
  const login = (user: User, token: string) => { 
    setCurrentUser(user); 
    localStorage.setItem('user', JSON.stringify(user)); 
    localStorage.setItem('token', token); 
    closeModal(); 
    navigate('/dashboard'); 
  }; 
  
  const logout = () => { 
    setCurrentUser(null); 
    localStorage.removeItem('user'); 
    localStorage.removeItem('token'); 
    navigate('/'); 
  }; 
  
  const contextValue: AppContextType = { 
    theme, 
    currentUser, 
    isLoadingAuth, 
    toggleTheme, 
    openModal, 
    logout, 
    login 
  }; 
  
  return ( 
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen w-full font-sans relative overflow-hidden">
        <VideoBackground theme={theme} />
        {children}
        <AuthModal isOpen={isModalOpen} onClose={closeModal} initialMode={authMode} />
      </div>
    </AppContext.Provider>
  ); };

// --- Final App Structure ---
export default function AppWrapper() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        return <div className="min-h-screen w-full flex items-center justify-center bg-red-100 text-red-800">Error: VITE_GOOGLE_CLIENT_ID is not set in the .env file.</div>;
    }

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <BrowserRouter>
                <AppProvider>
                    <Routes>
                        <Route path="/" element={<AppLayout />}>
                            <Route index element={<HomePage />} />
                            <Route element={<ProtectedRoute />}>
                                <Route path="dashboard" element={<DashboardPage />} />
                            </Route>
                        </Route>
                    </Routes>
                </AppProvider>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}