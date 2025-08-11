import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Used to make API calls to the backend

// --- API Configuration ---
// This is the URL of the backend server we created.
const API_URL = 'http://localhost:5001/api';

// --- SVG Icons ---
const LogoIcon = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
             <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" className="stop-color-light dark:stop-color-dark-start" />
                <stop offset="100%" className="stop-color-dark dark:stop-color-dark-end" />
            </linearGradient>
        </defs>
        <path d="M20 80 Q 50 80, 50 50" fill="none" className="stroke-light dark:stroke-dark-start" strokeWidth="12" strokeLinecap="round"/>
        <path d="M50 50 Q 50 20, 80 20" fill="none" stroke="url(#grad3)" strokeWidth="12" strokeLinecap="round"/>
        <style>
            {`
                .stop-color-light { stop-color: #a5b4fc; }
                .stop-color-dark { stop-color: #4f46e5; }
                .stroke-light { stroke: #a5b4fc; }
                .dark .stop-color-dark-start { stop-color: #c4b5fd; }
                .dark .stop-color-dark-end { stop-color: #6366f1; }
                .dark .stroke-dark-start { stroke: #c4b5fd; }
            `}
        </style>
    </svg>
);
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.22 5.22a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM13.66 6.34a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 11-1.06 1.06l-1.06-1.06zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm14.25.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zm-6.03 4.47a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zm1.06-1.06a.75.75 0 011.06 0l1.06 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18z" clipRule="evenodd" /></svg>
);
const BriefcaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v1H6a2 2 0 00-2 2v7a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2V4a2 2 0 00-2-2zm-1 2V4a1 1 0 112 0v1H9z" clipRule="evenodd" /></svg>
);
const ChatBubbleLeftRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 mr-2"><path fillRule="evenodd" d="M10 2c-2.236 0-4.43.89-6.08 2.418a.75.75 0 00.96 1.144A7.49 7.49 0 0110 3.5c1.554 0 2.999.462 4.242 1.238a.75.75 0 00.96-1.144A8.962 8.962 0 0010 2zM3.92 15.582A8.962 8.962 0 0010 18c2.236 0 4.43-.89 6.08-2.418a.75.75 0 00-.96-1.144A7.49 7.49 0 0110 16.5c-1.554 0-2.999-.462-4.242-1.238a.75.75 0 00-.96 1.144z" clipRule="evenodd" /><path d="M2.122 7.034a.75.75 0 001.038-.283A7.465 7.465 0 0110 5.5c1.843 0 3.543.64 4.84 1.751a.75.75 0 001.038.283c.32-.244.4-.698.156-1.018A8.962 8.962 0 0010 4c-2.54 0-4.857.996-6.634 2.618a.75.75 0 00.756 1.416zM2.122 12.966a.75.75 0 00-.756-1.416A8.962 8.962 0 0010 16c2.54 0 4.857-.996 6.634-2.618a.75.75 0 00-.756-1.416.75.75 0 00-1.038.283A7.465 7.465 0 0110 14.5c-1.843 0-3.543-.64-4.84-1.751a.75.75 0 00-1.038.283z" /></svg>
);
const SendIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
);
const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
);
const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
);
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
);
const TypingIndicator = () => (
    <div className="flex items-center space-x-1.5"><div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div><div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div><div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div></div>
);

// --- React Components ---

const VideoBackground = () => (
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <img 
            src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTBsc2I0ZzNqZ3U5d2Y5b3J5dG5oY2JqNnN4c3A2dG16a2c2ajc2eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9C25UNTwfZuE0aYg/giphy.gif"
            alt="Abstract network animation"
            className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black/80"></div>
    </div>
);

const Navbar = ({ theme, toggleTheme }) => (
    <nav className="w-full p-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
            <LogoIcon />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-wide">
                <span className="text-indigo-600 dark:text-indigo-400">C</span>areerion
            </h1>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
                Sign up
            </button>
            <button className="text-slate-700 dark:text-gray-200 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors">
                Log in
            </button>
        </div>
    </nav>
);

const MainContent = () => (
    <div className="w-full lg:w-1/2 p-6 flex flex-col justify-center"><h1 className="text-5xl md:text-6xl font-bold text-slate-800 dark:text-white leading-tight">Beyond the Job Board.<br />Discover Your True Potential.</h1><p className="mt-8 text-lg text-slate-600 dark:text-gray-300">Whether you're a student, a graduate, or a professional, our AI-powered coach <br />helps you discover and navigate the career you were meant for.</p></div>
);

const CareerCoach = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isChatting, setIsChatting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isChatting) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatting]);

    const handleBack = () => {
        setIsChatting(false);
        setMessages([]);
        setError(null);
    };

    const getAIResponse = async (userMessage) => {
        setIsLoading(true);
        setError(null);
        
        const history = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        try {
            const res = await axios.post(`${API_URL}/chat`, {
                history: history,
                message: userMessage.text
            });
            setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]);
        } catch (err) {
            setError('Sorry, something went wrong. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const startConversation = (topic) => {
        setIsChatting(true);
        let userMessageText = '';
        switch(topic) {
            case 'discover': userMessageText = 'Help me discover my career path.'; break;
            case 'explore': userMessageText = 'I want to explore some career fields.'; break;
            case 'chat': userMessageText = 'I just want to chat.'; break;
            default: return;
        }
        const userMessage = { sender: 'user', text: userMessageText };
        setMessages([userMessage]);
        getAIResponse(userMessage);
    };

    const handleSendMessage = () => {
        if (input.trim() === '' || isLoading) return;
        if (!isChatting) setIsChatting(true);
        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        getAIResponse(userMessage);
    };

    const InitialButtons = () => (
        <div className="space-y-4 p-4">
            <button onClick={() => startConversation('discover')} className="w-full flex items-center justify-center text-left p-4 bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-md"><SparklesIcon />Discover My Career Path</button>
            <button onClick={() => startConversation('explore')} className="w-full flex items-center justify-center text-left p-4 bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-md"><BriefcaseIcon />Explore Career Fields</button>
            <button onClick={() => startConversation('chat')} className="w-full flex items-center justify-center text-left p-4 bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-md"><ChatBubbleLeftRightIcon />Chat with AI</button>
        </div>
    );

    const MessageList = () => (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">{messages.map((msg, index) => (<div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>{msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0"></div>}<div className={`px-4 py-2 rounded-lg max-w-xs md:max-w-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-gray-200'}`}>{msg.text}</div></div>))}{isLoading && (<div className="flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-indigo-500 flex-shrink-0"></div><div className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-gray-700"><TypingIndicator /></div></div>)}{error && <div className="text-center text-red-500 text-sm p-2">{error}</div>}<div ref={chatEndRef} /></div>
    );

    return (
        <div className="w-full lg:w-1/2 p-6 flex items-center justify-center"><div className="w-full max-w-md h-[70vh] flex flex-col bg-white dark:bg-white/5 dark:backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg"><div className="flex items-center justify-center relative p-4 border-b border-slate-200 dark:border-white/10 flex-shrink-0">{isChatting && (<button onClick={handleBack} className="absolute left-4 p-1 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"><ArrowLeftIcon /></button>)}<h2 className="text-xl font-semibold text-slate-800 dark:text-white">Career Coach</h2></div><div className="flex-grow overflow-y-auto">{isChatting ? <MessageList /> : <InitialButtons />}</div><div className="p-4 border-t border-slate-200 dark:border-white/10 flex-shrink-0"><div className="relative"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder={isChatting ? "Type your message..." : "Or ask anything about your career..."} className="w-full bg-slate-100 dark:bg-white/10 border border-slate-300 dark:border-white/20 rounded-full py-3 pl-4 pr-12 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" disabled={isLoading} /><button onClick={handleSendMessage} disabled={isLoading || input.trim() === ''} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-800 transition-colors"><SendIcon /></button></div></div></div></div>
    );
};

// The main App component that brings everything together
export default function App() {
    const [theme, setTheme] = useState('dark');
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);
    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    return (
        <div className="min-h-screen w-full font-sans bg-slate-50 dark:bg-gray-900 relative">
            {theme === 'dark' && <VideoBackground />}
            <div className="relative z-10">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main className="flex flex-col lg:flex-row container mx-auto px-6 pb-12">
                    <MainContent />
                    <CareerCoach />
                </main>
            </div>
        </div>
    );
}
