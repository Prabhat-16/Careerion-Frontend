import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GoogleOAuthProvider, GoogleLogin, googleLogout, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

type User = {
  name: string;
  email: string;
  picture?: string;
  // Add other user properties as needed
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (credentialResponse: CredentialResponse) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL as string) || 'http://localhost:5001/api',
  });

  // Attach token automatically if available
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      (config.headers as any)['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });
      // Persist token for subsequent authorized requests
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
      googleLogout();
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login: handleLoginSuccess,
    logout: handleLogout,
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </GoogleOAuthProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const GoogleLoginButton = () => {
  const { login } = useAuth();
  return (
    <GoogleLogin
      onSuccess={login}
      onError={() => {
        console.error('Login Failed');
      }}
      useOneTap
    />
  );
};
