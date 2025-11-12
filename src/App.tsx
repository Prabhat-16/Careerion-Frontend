import React, { useState, useEffect, createContext, useContext } from 'react';
import type { FC, ReactNode } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
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

interface CareerRecommendation {
  title: string;
  description: string;
  key_skills: string[];
}
interface ProfileFormData {
  // Personal Information
  name: string;
  age: string;
  location: string;
  
  // Education
  educationLevel: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
  
  // Experience
  workExperience: string;
  currentJobTitle: string;
  yearsOfExperience: string;
  
  // Skills & Interests
  technicalSkills: string;
  softSkills: string;
  skills: string; // Added for compatibility
  interests: string;
  hobbies: string;
  
  // Career Goals
  careerGoals: string;
  preferredIndustries: string;
  workEnvironment: string;
  salaryExpectations: string;
  willingToRelocate: string;
  
  // Additional Info
  strengths: string;
  challenges: string;
  motivations: string;
}

// --- Context for Global State Management ---
interface AppContextType {
  theme: string;
  currentUser: User | null;
  isLoadingAuth: boolean;
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
const SendIcon: FC<IconProps> = ({ className = '' }) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
  </svg> 
);

// --- Reusable Components ---
const VideoBackground: FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/videos/Robot-3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-slate-800/15 to-slate-900/25"></div>
    </div>
  );
};

// UPDATED: Navbar component with theme toggle button removed
const Navbar: FC = () => { 
  const { currentUser, logout, openModal } = useAppContext(); 
  
  return ( 
    <nav className="w-full p-4 flex justify-between items-center mb-4 backdrop-blur-md navbar-glow">
      <div className="flex items-center space-x-3">
        <LogoIcon />
        <h1 className="text-2xl font-bold tracking-wide text-slate-800 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">C</span>areerion
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* THEME TOGGLE BUTTON REMOVED */}

        {currentUser ? ( 
          <>
            <span className="text-sm text-slate-700 dark:text-gray-300 hidden sm:block">
              Welcome, {currentUser.name.split(' ')[0]}
            </span>
            <button 
              onClick={logout} 
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors"
            >
              Log out
            </button>
          </> 
        ) : ( 
          <>
            <button 
              onClick={() => openModal('signup')} 
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-semibold border border-indigo-500 hover:bg-indigo-700 transition-colors"
            >
              Sign up
            </button>
            <button 
              onClick={() => openModal('login')} 
              className="px-5 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors"
            >
              Log in
            </button>
          </> 
        )}
      </div>
    </nav> 
  ); 
};

const MainContent: FC = () => {

  return (
    <div className="w-full lg:w-1/2 p-4 flex flex-col justify-center items-center min-h-0">
      <div className="glass-panel w-full max-w-2xl">
        <div className="glass-panel-inner text-center">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 text-gradient"
          >
            Elevate Your Professional Journey
          </h1>
          <h2 
            className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-700 dark:text-indigo-200 mb-6"
          >
            Strategic Career Development
          </h2>
          <p 
            className="text-lg sm:text-xl text-slate-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed font-medium"
          >
            AI-powered career guidance for professionals
          </p>
        </div>
      </div>
    </div>
  );
};

// Import the enhanced career chat component
import EnhancedCareerChat from './components/EnhancedCareerChat';
// Import the enhanced career dashboard
import CareerDashboard from './components/CareerDashboard';

const CareerCoach: FC = () => { 
  return ( 
    <div className="w-full lg:w-1/2 p-6 flex items-center justify-center slide-in-right">
      <div className="glass-panel w-full max-w-md h-[70vh] flex flex-col rounded-2xl overflow-hidden border-2 border-indigo-300 dark:border-indigo-500 transition-colors">
        <div className="glass-panel-inner flex flex-col h-full">
          <EnhancedCareerChat className="h-full" />
        </div>
      </div>
    </div>
  ); 
};

// --- Page and Dashboard Components ---
const RecommendationsDisplay: FC<{ recommendations: CareerRecommendation[] }> = ({ recommendations }) => { return ( <div className="w-full max-w-4xl mx-auto"><h2 className="text-3xl font-bold glass-text mb-8">Here are your recommended career paths:</h2><div className="grid md:grid-cols-3 gap-6">{recommendations.map((rec, index) => ( <div key={index} className="p-6 rounded-2xl glass-effect dark-glass-effect"><h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{rec.title}</h3><p className="text-slate-600 dark:text-gray-300 text-sm mb-4">{rec.description}</p><h4 className="font-semibold text-slate-700 dark:text-gray-200 mb-2 text-sm">Key Skills:</h4><ul className="list-disc list-inside text-sm text-slate-600 dark:text-gray-300">{rec.key_skills.map((skill, i) => <li key={i}>{skill}</li>)}</ul></div> ))}</div></div> ); };
const FollowUpChat: FC<{ initialHistory: Message[] }> = ({ initialHistory }) => { const [messages, setMessages] = useState<Message[]>(initialHistory); const [input, setInput] = useState(''); const [isLoading, setIsLoading] = useState(false); const handleSendMessage = async () => { if (input.trim() === '' || isLoading) return; const userMessage: Message = { sender: 'user', text: input }; const newMessages = [...messages, userMessage]; setMessages(newMessages); setInput(''); setIsLoading(true); const history = newMessages.map(msg => ({ role: msg.sender === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] })); try { const res = await axios.post(`${API_URL}/chat`, { history, message: input }); setMessages(prev => [...prev, { sender: 'ai', text: res.data.response }]); } catch (error) { console.error(error); setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I ran into an error." }]); } finally { setIsLoading(false); } }; return ( <div className="w-full max-w-4xl mx-auto mt-12"><h2 className="text-3xl font-bold glass-text mb-8 text-center">Have more questions?</h2><div className="p-4 rounded-2xl glass-effect dark-glass-effect"><div className="relative"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSendMessage()} placeholder="Ask about these careers..." className="glass-input pr-12 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-400" disabled={isLoading} /><button onClick={handleSendMessage} disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-800 transition-colors"><SendIcon /></button></div></div></div> ); };
const ProfileForm: FC<{ onGetRecommendations: (data: ProfileFormData) => void, isLoading: boolean }> = ({ onGetRecommendations, isLoading }) => { 
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>({ 
    // Personal Information
    name: '',
    age: '',
    location: '',
    
    // Education
    educationLevel: '',
    fieldOfStudy: '',
    institution: '',
    graduationYear: '',
    
    // Experience
    workExperience: '',
    currentJobTitle: '',
    yearsOfExperience: '',
    
    // Skills & Interests
    technicalSkills: '',
    softSkills: '',
    interests: '',
    hobbies: '',
    
    // Career Goals
    careerGoals: '',
    preferredIndustries: '',
    workEnvironment: '',
    salaryExpectations: '',
    willingToRelocate: '',
    
    // Additional Info
    strengths: '',
    challenges: '',
    motivations: ''
  }); 
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); 
  }; 
  
  const handleSubmit = (e: React.FormEvent) => { 
    e.preventDefault(); 
    onGetRecommendations(formData); 
  }; 

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="form-section-header">
              <h3 className="form-section-title">
                Personal Information
              </h3>
              <p className="form-section-subtitle">
                Tell us about yourself to get started
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-field-group">
                <label>Full Name *</label>
                <input 
                  type="text"
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  placeholder="Your full name" 
                  required 
                />
              </div>
              
              <div className="form-field-group">
                <label>Age Range *</label>
                <select 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select age range</option>
                  <option value="18-22">18-22</option>
                  <option value="23-27">23-27</option>
                  <option value="28-32">28-32</option>
                  <option value="33-37">33-37</option>
                  <option value="38-42">38-42</option>
                  <option value="43+">43+</option>
                </select>
              </div>
            </div>
            
            <div className="form-field-group">
              <label>Location *</label>
              <input 
                type="text"
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                placeholder="City, State/Country" 
                required 
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-8">
            <div className="form-section-header">
              <h3 className="form-section-title">
                Education & Experience
              </h3>
              <p className="form-section-subtitle">
                Share your educational background and professional experience
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-field-group">
                <label>Education Level *</label>
                <select 
                  name="educationLevel" 
                  value={formData.educationLevel} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Associate Degree">Associate Degree</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="PhD/Doctorate">PhD/Doctorate</option>
                  <option value="Professional Certification">Professional Certification</option>
                  <option value="Self-taught">Self-taught</option>
                </select>
              </div>
              
              <div className="form-field-group">
                <label>Field of Study</label>
                <input 
                  type="text"
                  name="fieldOfStudy" 
                  value={formData.fieldOfStudy} 
                  onChange={handleChange} 
                  placeholder="e.g., Computer Science, Business, Psychology" 
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-field-group">
                <label>Institution</label>
                <input 
                  type="text"
                  name="institution" 
                  value={formData.institution} 
                  onChange={handleChange} 
                  placeholder="University/School name" 
                />
              </div>
              
              <div className="form-field-group">
                <label>Years of Experience *</label>
                <select 
                  name="yearsOfExperience" 
                  value={formData.yearsOfExperience} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select experience</option>
                  <option value="0">No experience</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>
            </div>
            
            <div className="form-field-group">
              <label>Current Job Title</label>
              <input 
                type="text"
                name="currentJobTitle" 
                value={formData.currentJobTitle} 
                onChange={handleChange} 
                placeholder="e.g., Software Developer, Marketing Manager, Student" 
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-8">
            <div className="form-section-header">
              <h3 className="form-section-title">
                Skills & Interests
              </h3>
              <p className="form-section-subtitle">
                Help us understand your abilities and what drives you
              </p>
            </div>
            
            <div className="form-field-group">
              <label>Technical Skills * <span className="text-sm text-slate-500">(separate with commas)</span></label>
              <textarea 
                name="technicalSkills" 
                value={formData.technicalSkills} 
                onChange={handleChange} 
                placeholder="Python, JavaScript, SQL, Adobe Creative Suite, Data Analysis, Machine Learning, React, Node.js, AWS, Docker..." 
                rows={4}
                required 
              />
              <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                💡 Add each skill separated by commas for better AI career recommendations
              </div>
            </div>
            
            <div className="form-field-group">
              <label>Soft Skills * <span className="text-sm text-slate-500">(separate with commas)</span></label>
              <textarea 
                name="softSkills" 
                value={formData.softSkills} 
                onChange={handleChange} 
                placeholder="Leadership, Communication, Problem-solving, Teamwork, Time Management, Critical Thinking, Adaptability..." 
                rows={4}
                required 
              />
              <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                💡 List your interpersonal and professional soft skills separated by commas
              </div>
            </div>
            
            <div className="form-field-group">
              <label>Professional Interests * <span className="text-sm text-slate-500">(separate with commas)</span></label>
              <textarea 
                name="interests" 
                value={formData.interests} 
                onChange={handleChange} 
                placeholder="Artificial Intelligence, Healthcare Innovation, Sustainable Energy, Digital Marketing, Data Science, Cybersecurity..." 
                rows={4}
                required 
              />
              <div className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                💡 List your professional interests and industry areas separated by commas
              </div>
            </div>
            
            <div className="form-field-group">
              <label>Hobbies & Personal Interests</label>
              <textarea 
                name="hobbies" 
                value={formData.hobbies} 
                onChange={handleChange} 
                placeholder="e.g., Photography, Gaming, Reading, Sports, Music, Volunteering..." 
                rows={3}
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-8">
            <div className="form-section-header">
              <h3 className="form-section-title">
                Career Goals & Preferences
              </h3>
              <p className="form-section-subtitle">
                Tell us about your career aspirations and work preferences
              </p>
            </div>
            
            <div className="form-field-group">
              <label>Career Goals *</label>
              <textarea 
                name="careerGoals" 
                value={formData.careerGoals} 
                onChange={handleChange} 
                placeholder="e.g., Become a senior developer, Start my own business, Work in healthcare innovation..." 
                rows={4}
                required 
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-field-group">
                <label>Preferred Work Environment *</label>
                <select 
                  name="workEnvironment" 
                  value={formData.workEnvironment} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select preference</option>
                  <option value="Remote">Remote</option>
                  <option value="In-office">In-office</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              
              <div className="form-field-group">
                <label>Willing to Relocate? *</label>
                <select 
                  name="willingToRelocate" 
                  value={formData.willingToRelocate} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>
            </div>
            
            <div className="form-field-group">
              <label>Preferred Industries *</label>
              <textarea 
                name="preferredIndustries" 
                value={formData.preferredIndustries} 
                onChange={handleChange} 
                placeholder="e.g., Technology, Healthcare, Finance, Education, Entertainment, Non-profit..." 
                rows={3}
                required 
              />
            </div>
            
            <div className="form-field-group">
              <label>What motivates you most in your career? *</label>
              <textarea 
                name="motivations" 
                value={formData.motivations} 
                onChange={handleChange} 
                placeholder="e.g., Making a positive impact, Financial stability, Creative expression, Continuous learning..." 
                rows={4}
                required 
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return ( 
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient mb-6 text-with-shadow">
          Welcome to Your Career Journey
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-white mb-4 text-with-shadow">
          Let's Build Your Complete Profile
        </h2>
        <p className="text-lg text-slate-700 dark:text-gray-200 max-w-3xl mx-auto text-with-shadow leading-relaxed">
          The more we know about you, the better career recommendations we can provide. This comprehensive profile will help us understand your background, skills, and aspirations.
        </p>
      </div>
      
      {/* Progress Indicator */}
      <div className="progress-indicator mb-12">
        {[1, 2, 3, 4].map((step, index) => (
          <React.Fragment key={step}>
            <div
              className={`progress-dot ${
                step < currentStep ? 'completed' : 
                step === currentStep ? 'active' : 'inactive'
              }`}
            />
            {index < 3 && (
              <div className={`progress-line ${step < currentStep ? 'completed' : step === currentStep ? 'active' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Step Counter */}
      <div className="step-counter mb-8">
        Step {currentStep} of 4
      </div>
      
      {/* Main Form Container */}
      <div className="glass-panel-prominent">
        <div className="glass-panel-prominent-inner">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form Step Content */}
            <div className="form-step-container">
              <div className="form-step">
                {renderStep()}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="form-navigation">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="btn-secondary"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary"
                >
                  Next Step
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className={`btn-primary ${isLoading ? 'btn-loading' : ''}`}
                >
                  {isLoading ? 'Analyzing Your Profile...' : 'Get My Career Recommendations'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  ); 
};
const DashboardPage: FC = () => {
  return <CareerDashboard />;
};

// User Profile Form Page - shown after login
const UserProfileFormPage: FC = () => {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[] | null>(null);
  const [initialHistory, setInitialHistory] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Robust extractor for JSON array/object from a possibly noisy string
  const extractJson = (text: string): any | null => {
    if (!text) return null;
    let cleaned = text
      .replace(/```json[\s\S]*?```/gi, (m) => m.replace(/```json|```/gi, ''))
      .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
      .trim();
    const start = cleaned.search(/[\[{]/);
    if (start === -1) return null;
    cleaned = cleaned.slice(start);
    // Try full parse first
    try { return JSON.parse(cleaned); } catch {}
    // Try shrinking from the end
    for (let i = cleaned.length; i > 0; i--) {
      const candidate = cleaned.slice(0, i).trim();
      try { return JSON.parse(candidate); } catch {}
    }
    return null;
  };

  const handleGetRecommendations = async (profileData: ProfileFormData) => {
    setIsLoading(true);
    setError(null);
    const prompt = `Based on the following user profile, recommend 3 career paths. For each path, provide a "title", a "description", and an array of 3 "key_skills". Return ONLY valid JSON (array of objects) with no extra text.\nUser Profile:\n- Skills: ${profileData.skills}\n- Interests: ${profileData.interests}`;
    const historyForChat: Message[] = [{ sender: 'user', text: `Here is my profile for career recommendations:\nSkills: ${profileData.skills}\nInterests: ${profileData.interests}` }];
    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: prompt,
        expectJson: true,
        systemPrompt: 'Reply with ONLY valid minified JSON (array of objects with keys: title, description, key_skills). No prose, no markdown.',
      });

      let parsed: any = res.data?.json || null;
      if (!parsed) {
        parsed = extractJson(res.data?.response || '');
      }
      if (!parsed) throw new Error('No JSON could be extracted');

      // Basic validation
      if (!Array.isArray(parsed)) throw new Error('Parsed JSON is not an array');
      const normalized: CareerRecommendation[] = parsed.map((item: any) => ({
        title: String(item.title || ''),
        description: String(item.description || ''),
        key_skills: Array.isArray(item.key_skills) ? item.key_skills.map((s: any) => String(s)) : [],
      }));

      setRecommendations(normalized);
      historyForChat.push({ sender: 'ai', text: `Based on your profile, here are some recommendations: ${JSON.stringify(normalized, null, 2)}`});
      setInitialHistory(historyForChat);
    } catch (err) {
      console.error('Error parsing AI response:', err);
      setError("Sorry, we couldn't get recommendations. The AI response might have been in an unexpected format. Please try rephrasing your skills and interests.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {!recommendations ? (
          <div className="glass-panel-prominent max-w-3xl mx-auto">
            <div className="glass-panel-prominent-inner">
              <ProfileForm onGetRecommendations={handleGetRecommendations} isLoading={isLoading} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="glass-panel">
              <div className="glass-panel-inner">
                <RecommendationsDisplay recommendations={recommendations} />
              </div>
            </div>
            <div className="glass-panel">
              <div className="glass-panel-inner">
                <FollowUpChat initialHistory={initialHistory} />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="glass-panel mt-6">
            <div className="glass-panel-inner">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const HomePage: FC = () => { 
  const { currentUser } = useAppContext();
  
  // If user is logged in, show the profile form
  if (currentUser) {
    return <UserProfileFormPage />;
  }
  
  // If user is not logged in, show the main landing page
  return ( 
    <main className="flex flex-col lg:flex-row container mx-auto px-6 pb-12">
      <MainContent />
      <CareerCoach />
    </main> 
  ); 
};
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
  const [formData, setFormData] = useState({ name: '', email: '', password: '' }); 
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null); 
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const { login } = useAppContext();

  // Handler for GoogleLogin component (ID token flow)
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      console.log('Google Login Success (ID Token):', credentialResponse);
      const res = await axios.post(`${API_URL}/auth/google`, { 
        token: credentialResponse.credential, 
      }); 
      login(res.data.user, res.data.token); 
      onClose(); 
    } catch (err) { 
      setError('Google Sign-In failed. Please try again.'); 
      console.error('Google Login Error:', err); 
    } finally { 
      setIsLoading(false); 
    } 
  };

 

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
              {/* Google Login Component */}
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => {
                    console.error('Google Login Failed');
                    setError('Google Sign-In failed. Please try again.');
                  }}
                  useOneTap={false}
                  context={mode === 'login' ? 'signin' : 'signup'}
                  text={mode === 'login' ? 'signin_with' : 'signup_with'}
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="100%"
                  auto_select={false}
                />
              </div>
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

// UPDATED: AppProvider is now permanently in dark mode
const AppProvider: FC<{ children: ReactNode }> = ({ children }) => { 
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login'); 
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true); 
  const navigate = useNavigate(); 
  
  // This useEffect now permanently sets dark mode on load
  useEffect(() => { 
    document.documentElement.classList.add('dark'); 
  }, []); 
  
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
    theme: 'dark', // Theme is now hardcoded to 'dark'
    currentUser, 
    isLoadingAuth, 
    openModal, 
    logout, 
    login,
    // toggleTheme function is removed
  }; 
  
  return ( 
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen w-full font-sans relative overflow-hidden">
        <VideoBackground />
        {children}
        <AuthModal isOpen={isModalOpen} onClose={closeModal} initialMode={authMode} />
      </div>
    </AppContext.Provider>
  ); 
};

// --- Final App Structure ---
export default function AppWrapper() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!googleClientId) {
        return <div className="min-h-screen w-full flex items-center justify-center bg-red-100 text-red-800">Error: VITE_GOOGLE_CLIENT_ID is not set in the .env file.</div>;
    }

    return (
        <GoogleOAuthProvider 
            clientId={googleClientId}
            onScriptLoadError={() => console.error('Google OAuth script failed to load')}
            onScriptLoadSuccess={() => console.log('Google OAuth script loaded successfully')}
        >
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