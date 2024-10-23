import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';

const ConsultationPopup = ({ onClose, onStartConsultation, onChatClick, isMinimized }) => {
  if (isMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={onChatClick}  // Changed from onStartConsultation to onChatClick
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            minWidth: 'unset',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          <ChatIcon fontSize="large" />
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: '100%',
        maxWidth: 350,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        p: 3,
        zIndex: 1000,
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
        }}
      >
        <CloseIcon />
      </IconButton>

      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Get Expert Insurance Guidance
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
        Join thousands of Americans who found better coverage for less. Our expert consultation takes just 5 minutes and can save you hundreds monthly.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          ✓ Personalized plan recommendations
        </Typography>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          ✓ Compare prices instantly
        </Typography>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          ✓ Find hidden savings opportunities
        </Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={onStartConsultation}
        sx={{
          mt: 3,
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1.1rem',
        }}
      >
        Start Free Consultation
      </Button>
    </Box>
  );
};

export default ConsultationPopup;