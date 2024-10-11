// src/pages/Cancel.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Payment Canceled
      </Typography>
      <Typography variant="body1" gutterBottom>
        Your payment was canceled. You can retry the payment or return to the home page.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </Box>
  );
};

export default Cancel;
