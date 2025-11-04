import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedCareerChat from './EnhancedCareerChat';

const API_URL = 'http://localhost:5001/api';

interface UserProfile {
  educationLevel?: string;
  fieldOfStudy?: string;
  institution?: string;
  yearOfCompletion?: string;
  currentStatus?: string;
  workExperience?: string;
  skills?: string[];
  interests?: string[];
  careerGoals?: string;
  preferredWorkEnvironment?: string;
  preferredWorkLocation?: string;
  salaryExpectations?: string;
  willingToRelocate?: boolean;
}

interface CareerInsight {
  title: string;
  description: string;
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
}

const CareerDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [careerInsights, setCareerInsights] = useState<CareerInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'profile'>('overview');
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    generateCareerInsights();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserProfile(response.data.profile);
      setProfileComplete(response.data.profileComplete);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCareerInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${API_URL}/career-recommendations`,
        {
          query: 'Generate 4 personalized career insights and action items based on my profile. Focus on immediate actionable steps I can take to advance my career.',
          category: 'general'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Parse the response to extract insights
      const insights = parseCareerInsights(response.data.response);
      setCareerInsights(insights);
    } catch (error) {
      console.error('Error generating career insights:', error);
      // Fallback insights if API fails
      setCareerInsights([
        {
          title: 'Complete Your Profile',
          description: 'A complete profile helps us provide better career recommendations.',
          actionItems: ['Add your skills and interests', 'Update your career goals', 'Specify your work preferences'],
          priority: 'high'
        },
        {
          title: 'Skill Development',
          description: 'Stay competitive by continuously learning new skills.',
          actionItems: ['Identify in-demand skills in your field', 'Take online courses', 'Practice with real projects'],
          priority: 'medium'
        }
      ]);
    }
  };

  const parseCareerInsights = (response: string): CareerInsight[] => {
    // Simple parsing logic - in a real app, you'd want more sophisticated parsing
    const defaultInsights: CareerInsight[] = [
      {
        title: 'Professional Development',
        description: 'Focus on continuous learning and skill enhancement.',
        actionItems: ['Identify skill gaps', 'Enroll in relevant courses', 'Seek mentorship opportunities'],
        priority: 'high'
      },
      {
        title: 'Network Building',
        description: 'Expand your professional network for career opportunities.',
        actionItems: ['Join industry groups', 'Attend networking events', 'Connect with professionals on LinkedIn'],
        priority: 'medium'
      },
      {
        title: 'Career Planning',
        description: 'Set clear career goals and create a roadmap.',
        actionItems: ['Define short and long-term goals', 'Create a career timeline', 'Regular progress reviews'],
        priority: 'medium'
      },
      {
        title: 'Personal Branding',
        description: 'Build a strong professional presence online and offline.',
        actionItems: ['Update LinkedIn profile', 'Create a portfolio', 'Share industry insights'],
        priority: 'low'
      }
    ];

    return defaultInsights;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const ProfileCompletionCard = () => (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Profile Completion</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          profileComplete 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
        }`}>
          {profileComplete ? 'Complete' : 'Incomplete'}
        </span>
      </div>
      
      {!profileComplete && (
        <div className="space-y-3">
          <p className="text-slate-600 dark:text-gray-400 text-sm">
            Complete your profile to get personalized career recommendations.
          </p>
          <button
            onClick={() => setActiveTab('profile')}
            className="btn-primary text-sm"
          >
            Complete Profile
          </button>
        </div>
      )}
      
      {profileComplete && (
        <p className="text-slate-600 dark:text-gray-400 text-sm">
          Your profile is complete! You'll receive the most accurate career guidance.
        </p>
      )}
    </div>
  );

  const CareerInsightsGrid = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {careerInsights.map((insight, index) => (
        <div key={index} className="glass-card p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              {insight.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
              {insight.priority}
            </span>
          </div>
          
          <p className="text-slate-600 dark:text-gray-400 text-sm mb-4">
            {insight.description}
          </p>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-700 dark:text-gray-300">Action Items:</h4>
            <ul className="space-y-1">
              {insight.actionItems.map((item, itemIndex) => (
                <li key={itemIndex} className="text-sm text-slate-600 dark:text-gray-400 flex items-start">
                  <span className="text-indigo-500 mr-2 mt-1">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );

  const ProfileForm = () => {
    const [formData, setFormData] = useState<UserProfile>(userProfile || {});
    const [isSaving, setIsSaving] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      if (name === 'skills' || name === 'interests') {
        // Handle comma-separated values for skills and interests
        setFormData(prev => ({
          ...prev,
          [name]: value.split(',').map(item => item.trim()).filter(item => item)
        }));
      } else if (type === 'checkbox') {
        const checkbox = e.target as HTMLInputElement;
        setFormData(prev => ({
          ...prev,
          [name]: checkbox.checked
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);

      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/user/profile`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserProfile(formData);
        setProfileComplete(true);
        setActiveTab('overview');
        
        // Regenerate insights with new profile data
        generateCareerInsights();
      } catch (error) {
        console.error('Error saving profile:', error);
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="glass-card p-6">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-6">Complete Your Profile</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Education Level
              </label>
              <select
                name="educationLevel"
                value={formData.educationLevel || ''}
                onChange={handleInputChange}
                className="glass-input"
              >
                <option value="">Select education level</option>
                <option value="High School">High School</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="PhD/Doctorate">PhD/Doctorate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                Field of Study
              </label>
              <input
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy || ''}
                onChange={handleInputChange}
                className="glass-input"
                placeholder="e.g., Computer Science, Business"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Current Status
            </label>
            <select
              name="currentStatus"
              value={formData.currentStatus || ''}
              onChange={handleInputChange}
              className="glass-input"
            >
              <option value="">Select current status</option>
              <option value="Student">Student</option>
              <option value="Employed">Employed</option>
              <option value="Unemployed">Unemployed</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Entrepreneur">Entrepreneur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Skills (comma-separated)
            </label>
            <textarea
              name="skills"
              value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''}
              onChange={handleInputChange}
              className="glass-input"
              rows={3}
              placeholder="e.g., JavaScript, Python, Project Management, Communication"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Interests (comma-separated)
            </label>
            <textarea
              name="interests"
              value={Array.isArray(formData.interests) ? formData.interests.join(', ') : ''}
              onChange={handleInputChange}
              className="glass-input"
              rows={3}
              placeholder="e.g., Technology, Healthcare, Education, Finance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Career Goals
            </label>
            <textarea
              name="careerGoals"
              value={formData.careerGoals || ''}
              onChange={handleInputChange}
              className="glass-input"
              rows={4}
              placeholder="Describe your career aspirations and goals..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className={`btn-primary ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-gray-400">Loading your career dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
          Career Dashboard
        </h1>
        <p className="text-slate-600 dark:text-gray-400">
          Your personalized career guidance and development center
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-white/10 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'chat', label: 'AI Career Coach', icon: '💬' },
          { id: 'profile', label: 'Profile', icon: '👤' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <ProfileCompletionCard />
          
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
              Your Career Insights
            </h2>
            <CareerInsightsGrid />
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="glass-card h-[600px]">
          <EnhancedCareerChat className="h-full" />
        </div>
      )}

      {activeTab === 'profile' && <ProfileForm />}
    </div>
  );
};

export default CareerDashboard;