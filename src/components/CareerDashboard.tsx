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

interface AIRecommendation {
  response: string;
  modelUsed: string;
  timestamp: Date;
}

const CareerDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [careerInsights, setCareerInsights] = useState<CareerInsight[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
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
    setIsGeneratingInsights(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use the working chat API to generate career recommendations
      const response = await axios.post(
        `${API_URL}/chat`,
        {
          message: `Based on my profile, provide 4 specific career recommendations with actionable steps. Format your response using simple markdown with headers (##, ###) and bullet points (-). Avoid complex tables or excessive formatting.

          Structure each recommendation as:
          ## Career Path/Opportunity Title
          Brief description (1-2 sentences)
          
          ### Action Items:
          - Specific action item 1
          - Specific action item 2
          - Specific action item 3
          
          Focus on practical, actionable advice that I can implement right away to advance my career.`,
          expectJson: false
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Store the full AI recommendation
      setAiRecommendation({
        response: response.data.response,
        modelUsed: response.data.modelUsed || 'AI Model',
        timestamp: new Date()
      });

      // Parse the AI response to extract structured insights
      const insights = parseAICareerInsights(response.data.response);
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
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const parseAICareerInsights = (response: string): CareerInsight[] => {
    try {
      // Enhanced parsing to extract structured insights from AI response
      const insights: CareerInsight[] = [];
      
      // Split response into sections and look for numbered lists or clear patterns
      const sections = response.split(/\d+\.\s+|\n\n+/);
      
      // Look for patterns like "1. Title", "Description:", "Action Items:", etc.
      let currentInsight: Partial<CareerInsight> = {};
      
      for (const section of sections) {
        const trimmed = section.trim();
        if (!trimmed) continue;
        
        // Try to identify titles (usually at the start of sections)
        if (trimmed.length < 100 && !trimmed.includes('.') && insights.length < 4) {
          if (currentInsight.title) {
            // Save previous insight if complete
            if (currentInsight.title && currentInsight.description && currentInsight.actionItems) {
              insights.push(currentInsight as CareerInsight);
            }
          }
          currentInsight = {
            title: trimmed.replace(/^\d+\.\s*/, '').replace(/[*#-]/g, '').trim(),
            actionItems: [],
            priority: 'medium'
          };
        }
        // Look for descriptions (medium length paragraphs)
        else if (trimmed.length > 50 && trimmed.length < 300 && !currentInsight.description) {
          currentInsight.description = trimmed;
        }
        // Look for action items (bullet points or numbered lists)
        else if (trimmed.includes('•') || trimmed.includes('-') || /^\d+\./.test(trimmed)) {
          const items = trimmed.split(/[•\-]|\d+\./).filter(item => item.trim().length > 10);
          if (items.length > 0) {
            currentInsight.actionItems = items.map(item => item.trim()).slice(0, 4);
          }
        }
      }
      
      // Add the last insight
      if (currentInsight.title && currentInsight.description && currentInsight.actionItems) {
        insights.push(currentInsight as CareerInsight);
      }
      
      // If parsing didn't work well, create insights from the raw response
      if (insights.length === 0) {
        const lines = response.split('\n').filter(line => line.trim().length > 20);
        const chunks = [];
        for (let i = 0; i < lines.length; i += 3) {
          chunks.push(lines.slice(i, i + 3));
        }
        
        chunks.slice(0, 4).forEach((chunk, index) => {
          insights.push({
            title: `AI Recommendation ${index + 1}`,
            description: chunk[0] || 'Career guidance based on your profile.',
            actionItems: chunk.slice(1).filter(item => item.trim().length > 5).slice(0, 3),
            priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
          });
        });
      }
      
      // Ensure we have at least some insights
      if (insights.length === 0) {
        return [
          {
            title: 'AI Career Analysis',
            description: response.substring(0, 200) + '...',
            actionItems: ['Review the full AI response in the chat section', 'Update your profile for better recommendations', 'Ask specific career questions'],
            priority: 'high'
          }
        ];
      }
      
      return insights.slice(0, 4); // Limit to 4 insights
    } catch (error) {
      console.error('Error parsing AI insights:', error);
      // Return a single insight with the raw AI response
      return [
        {
          title: 'AI Career Guidance',
          description: 'Your personalized career recommendations from AI.',
          actionItems: ['View full recommendations in the chat section', 'Ask follow-up questions', 'Update your profile for better insights'],
          priority: 'high'
        }
      ];
    }
  };

  const formatAIResponse = (response: string) => {
    // Clean up and parse markdown formatting
    const lines = response.split('\n');
    const formattedLines: Array<{type: string, content: string, level?: number}> = [];
    
    for (let line of lines) {
      line = line.trim();
      
      // Skip empty lines, table separators, and markdown dividers
      if (!line || 
          line.match(/^\|[-:\s]*\|/) || 
          line.match(/^[-*]{3,}$/) ||
          line.match(/^\|.*\|.*\|/) ||
          line.includes('---|---')) {
        continue;
      }
      
      // Headers
      if (line.startsWith('### ')) {
        formattedLines.push({type: 'header', content: line.replace('### ', ''), level: 3});
      } else if (line.startsWith('## ')) {
        formattedLines.push({type: 'header', content: line.replace('## ', ''), level: 2});
      } else if (line.startsWith('# ')) {
        formattedLines.push({type: 'header', content: line.replace('# ', ''), level: 1});
      }
      // Bullet points
      else if (line.match(/^[-*+] /)) {
        formattedLines.push({type: 'bullet', content: line.replace(/^[-*+] /, '')});
      }
      // Numbered lists
      else if (line.match(/^\d+\. /)) {
        formattedLines.push({type: 'numbered', content: line.replace(/^\d+\. /, '')});
      }
      // Regular paragraphs
      else if (line.length > 0) {
        formattedLines.push({type: 'paragraph', content: line});
      }
    }
    
    return formattedLines;
  };

  const renderFormattedContent = (formattedLines: Array<{type: string, content: string, level?: number}>) => {
    return formattedLines.map((line, index) => {
      const content = line.content
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
        .replace(/\*(.*?)\*/g, '$1'); // Remove italic markdown
      
      switch (line.type) {
        case 'header':
          if (line.level === 1) {
            return <h1 key={index} className="text-2xl font-bold text-slate-800 dark:text-white mt-6 mb-4">{content}</h1>;
          } else if (line.level === 2) {
            return <h2 key={index} className="text-xl font-semibold text-slate-800 dark:text-white mt-6 mb-3">{content}</h2>;
          } else {
            return <h3 key={index} className="text-lg font-semibold text-slate-800 dark:text-white mt-4 mb-2">{content}</h3>;
          }
        case 'bullet':
          return (
            <div key={index} className="flex items-start mb-2">
              <span className="text-indigo-500 mr-2 mt-1">•</span>
              <span>{content}</span>
            </div>
          );
        case 'numbered':
          return (
            <div key={index} className="flex items-start mb-2 ml-4">
              <span className="text-indigo-500 mr-2">{index + 1}.</span>
              <span>{content}</span>
            </div>
          );
        case 'paragraph':
        default:
          return <p key={index} className="mb-3 leading-relaxed">{content}</p>;
      }
    });
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

  const AIRecommendationCard = () => (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-2xl mr-3">🤖</span>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              AI Career Recommendations
            </h3>
            {aiRecommendation && (
              <p className="text-sm text-slate-500 dark:text-gray-400">
                Generated by {aiRecommendation.modelUsed} • {aiRecommendation.timestamp.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={generateCareerInsights}
          disabled={isGeneratingInsights}
          className={`btn-primary text-sm ${isGeneratingInsights ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isGeneratingInsights ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </div>
          ) : (
            '🔄 Refresh'
          )}
        </button>
      </div>
      
      {aiRecommendation ? (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <div className="prose prose-sm max-w-none text-slate-700 dark:text-gray-300">
            {renderFormattedContent(formatAIResponse(aiRecommendation.response))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <p className="text-slate-600 dark:text-gray-400 mb-4">
            Get personalized career recommendations from our AI coach
          </p>
          <button
            onClick={generateCareerInsights}
            disabled={isGeneratingInsights}
            className="btn-primary"
          >
            Generate AI Recommendations
          </button>
        </div>
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
        setTimeout(() => {
          generateCareerInsights();
        }, 1000); // Small delay to ensure profile is saved
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
          
          <AIRecommendationCard />
          
          <div>
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">
              Quick Action Items
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