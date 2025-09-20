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
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/me', { withCredentials: true });
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
      const response = await axios.post('/api/auth/google', {
        token: credentialResponse.credential
      }, { withCredentials: true });
      
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
      googleLogout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login: () => {},
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
  return (
    <GoogleLogin
      onSuccess={handleLoginSuccess}
      onError={() => {
        console.error('Login Failed');
      }}
      useOneTap
    />
  );
};
