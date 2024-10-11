// src/pages/Success.js

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Optionally, you can perform any additional actions here
    // For example, display a thank you message, etc.
    // After a delay, redirect to the home page
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000); // Redirect after 5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Thank you for your payment. Your personalized insurance plan is being processed and will be delivered to your email within 24-48 hours.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </Box>
  );
};

export default Success;
