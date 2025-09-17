import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserInfoForm from '../components/UserInfoForm';
import { Box, Typography, CircularProgress } from '@mui/material';

const API_URL = 'http://localhost:5001/api';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Check if the profile is complete (you'll need to define what makes a profile complete)
        if (response.data.profileComplete) {
          setProfileComplete(true);
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        // If there's an error (e.g., 404 for no profile), we'll show the form
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileStatus();
  }, [navigate]);

  const handleProfileComplete = () => {
    // This function will be called when the user successfully submits the form
    setProfileComplete(true);
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (profileComplete) {
    return null; // or redirect to dashboard
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <UserInfoForm />
    </Box>
  );
};

export default UserProfilePage;
