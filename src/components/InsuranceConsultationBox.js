import React from 'react';
import { Box, Button, Typography, useTheme, useMediaQuery, Stack } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const InsuranceConsultationBox = ({ onStartConsultation }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 15, // Reduced from 20 to 15
        left: 15,    // Reduced from 20 to 15
        right: 15,   // Reduced from 20 to 15
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        padding: isMobile ? 2 : 3, // Reduced padding
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0px 6px 20px rgba(0,0,0,0.1)', // Slightly reduced shadow
        borderRadius: 14, // Reduced from 16 to 14
        maxWidth: 1000,    // Reduced from 1200 to 1000
        margin: '0 auto',
      }}
    >
      <Stack spacing={1} sx={{ flexGrow: 1, mr: isMobile ? 0 : 3, mb: isMobile ? 2 : 0 }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h2" 
          sx={{ 
            fontWeight: 700,
            color: theme.palette.primary.main,
          }}
        >
          Protect What Matters Most
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 500 }}>
          Get a personalized insurance plan in minutes. Find the health insurance plan that fits your needs and budget, today and into the future.
        </Typography>
      </Stack>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<ChatBubbleOutlineIcon />}
        onClick={onStartConsultation}
        sx={{
          whiteSpace: 'nowrap',
          fontWeight: 600,
          padding: '12px 24px', // Reduced padding
          borderRadius: '40px',  // Reduced from 50px to 40px
          textTransform: 'none',
          fontSize: '1rem',      // Reduced font size
          transition: 'all 0.3s ease',
          boxShadow: '0 3px 5px rgba(0,0,0,0.1)', // Slightly reduced shadow
          '&:hover': {
            transform: 'translateY(-1px)', // Reduced movement on hover
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        }}
      >
        Start Consultation
      </Button>
    </Box>
  );
};

export default InsuranceConsultationBox;