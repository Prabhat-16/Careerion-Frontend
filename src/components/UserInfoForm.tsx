import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const API_URL = 'http://localhost:5001/api';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  maxWidth: '800px',
  margin: '2rem auto',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const educationLevels = [
  '10th Pass',
  '12th Pass',
  'Diploma',
  'Undergraduate (Pursuing)',
  'Undergraduate (Completed)',
  'Postgraduate (Pursuing)',
  'Postgraduate (Completed)',
  'PhD (Pursuing)',
  'PhD (Completed)',
  'Other',
];

const fieldsOfStudy = [
  'Science',
  'Commerce',
  'Arts',
  'Engineering',
  'Medicine',
  'Law',
  'Business Administration',
  'Computer Applications',
  'Design',
  'Other',
];

const interests = [
  'Technology',
  'Business',
  'Healthcare',
  'Arts & Design',
  'Science & Research',
  'Education',
  'Engineering',
  'Finance',
  'Marketing',
  'Social Services',
  'Other',
];

const skills = [
  'Programming',
  'Data Analysis',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Project Management',
  'Public Speaking',
  'Research',
  'Language Proficiency',
  'Leadership',
];

const UserInfoForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    // Education Information
    educationLevel: '',
    fieldOfStudy: '',
    institution: '',
    yearOfCompletion: '',
    
    // Career Information
    currentStatus: '',
    workExperience: '',
    skills: [] as string[],
    
    // Interests and Goals
    interests: [] as string[],
    careerGoals: '',
    preferredWorkEnvironment: '',
    
    // Additional Information
    preferredWorkLocation: '',
    salaryExpectations: '',
    willingToRelocate: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleMultiSelect = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 0) {
      if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
      if (!formData.fieldOfStudy) newErrors.fieldOfStudy = 'Field of study is required';
      if (!formData.institution) newErrors.institution = 'Institution name is required';
    } else if (step === 1) {
      if (!formData.currentStatus) newErrors.currentStatus = 'Current status is required';
      if (formData.skills.length === 0) newErrors.skills = 'Please select at least one skill';
    } else if (step === 2) {
      if (formData.interests.length === 0) newErrors.interests = 'Please select at least one interest';
      if (!formData.careerGoals) newErrors.careerGoals = 'Career goals are required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(activeStep)) {
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/user/profile`, 
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success'
        });
        
        // Redirect to dashboard after successful submission
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
      } catch (error) {
        console.error('Error updating profile:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update profile. Please try again.',
          severity: 'error'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const steps = ['Education', 'Career', 'Interests & Goals', 'Additional Info'];

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.educationLevel} margin="normal">
                <InputLabel>Education Level</InputLabel>
                <Select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  label="Education Level"
                >
                  {educationLevels.map((level) => (
                    <MenuItem key={level} value={level}>{level}</MenuItem>
                  ))}
                </Select>
                {errors.educationLevel && <FormHelperText>{errors.educationLevel}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.fieldOfStudy} margin="normal">
                <InputLabel>Field of Study</InputLabel>
                <Select
                  name="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={handleChange}
                  label="Field of Study"
                >
                  {fieldsOfStudy.map((field) => (
                    <MenuItem key={field} value={field}>{field}</MenuItem>
                  ))}
                </Select>
                {errors.fieldOfStudy && <FormHelperText>{errors.fieldOfStudy}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                margin="normal"
                label="Institution Name"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                error={!!errors.institution}
                helperText={errors.institution}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                margin="normal"
                label="Year of Completion"
                name="yearOfCompletion"
                type="number"
                value={formData.yearOfCompletion}
                onChange={handleChange}
                inputProps={{ min: 1950, max: new Date().getFullYear() + 10 }}
              />
            </Grid>
          </Grid>
        );
      
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.currentStatus} margin="normal">
                <InputLabel>Current Status</InputLabel>
                <Select
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleChange}
                  label="Current Status"
                >
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Employed">Employed</MenuItem>
                  <MenuItem value="Unemployed">Unemployed</MenuItem>
                  <MenuItem value="Self-Employed">Self-Employed</MenuItem>
                  <MenuItem value="Freelancer">Freelancer</MenuItem>
                </Select>
                {errors.currentStatus && <FormHelperText>{errors.currentStatus}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Work Experience (in years)"
                name="workExperience"
                type="number"
                value={formData.workExperience}
                onChange={handleChange}
                inputProps={{ min: 0, max: 60, step: 0.5 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.skills} margin="normal">
                <InputLabel>Skills (Select multiple)</InputLabel>
                <Select
                  multiple
                  name="skills"
                  value={formData.skills}
                  onChange={(e) => handleMultiSelect('skills', e.target.value as string[])}
                  label="Skills (Select multiple)"
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {skills.map((skill) => (
                    <MenuItem key={skill} value={skill}>
                      <Checkbox checked={formData.skills.indexOf(skill) > -1} />
                      {skill}
                    </MenuItem>
                  ))}
                </Select>
                {errors.skills && <FormHelperText>{errors.skills}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );
      
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.interests} margin="normal">
                <InputLabel>Areas of Interest (Select multiple)</InputLabel>
                <Select
                  multiple
                  name="interests"
                  value={formData.interests}
                  onChange={(e) => handleMultiSelect('interests', e.target.value as string[])}
                  label="Areas of Interest (Select multiple)"
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {interests.map((interest) => (
                    <MenuItem key={interest} value={interest}>
                      <Checkbox checked={formData.interests.indexOf(interest) > -1} />
                      {interest}
                    </MenuItem>
                  ))}
                </Select>
                {errors.interests && <FormHelperText>{errors.interests}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Career Goals"
                name="careerGoals"
                multiline
                rows={4}
                value={formData.careerGoals}
                onChange={handleChange}
                error={!!errors.careerGoals}
                helperText={errors.careerGoals || "Describe your career aspirations and goals"}
                placeholder="I want to become a..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Preferred Work Environment"
                name="preferredWorkEnvironment"
                multiline
                rows={2}
                value={formData.preferredWorkEnvironment}
                onChange={handleChange}
                placeholder="E.g., Remote work, Office environment, Flexible hours, etc."
              />
            </Grid>
          </Grid>
        );
      
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Preferred Work Location"
                name="preferredWorkLocation"
                value={formData.preferredWorkLocation}
                onChange={handleChange}
                placeholder="E.g., New York, Remote, Anywhere"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Salary Expectations (per annum)"
                name="salaryExpectations"
                type="text"
                value={formData.salaryExpectations}
                onChange={handleChange}
                placeholder="E.g., $50,000 or Negotiable"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="willingToRelocate"
                    checked={formData.willingToRelocate}
                    onChange={handleCheckboxChange}
                    color="primary"
                  />
                }
                label="Willing to relocate for better opportunities"
              />
            </Grid>
          </Grid>
        );
      
      default:
        return 'Unknown step';
    }
  };

  return (
    <FormContainer elevation={3}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Complete Your Profile
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" align="center" paragraph>
        Help us provide better career recommendations by sharing more about yourself.
      </Typography>
      
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ minHeight: '300px', mb: 4 }}>
          {getStepContent(activeStep)}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
        </Box>
      </form>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity as 'success' | 'error'}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </FormContainer>
  );
};

export default UserInfoForm;
