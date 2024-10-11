import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

const InsuranceConsultationBox = ({ onStartConsultation }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        padding: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0px -2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, mr: 2 }}>
        Get a Tailored Insurance Plan That Fits Your Unique Needs
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        size="large"
        startIcon={<PersonIcon />}
        onClick={onStartConsultation}
        sx={{
          whiteSpace: 'nowrap',
          fontWeight: 'bold',
        }}
      >
        Start Consultation
      </Button>
    </Box>
  );
};

export default InsuranceConsultationBox;