import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Paper,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';

const Success = () => {
  const navigate = useNavigate();
  const [showReferral, setShowReferral] = useState(false);
  const [referralForm, setReferralForm] = useState({
    friendName: '',
    friendEmail: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleReferralChange = (e) => {
    const { name, value } = e.target;
    setReferralForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendReferral = () => {
    // Create the email subject and body
    const subject = `${referralForm.friendName} - thought you might like this health insurance tool`;
    const body = `Hi ${referralForm.friendName},

I just found an amazing tool to save money on health insurance, and I thought you might be interested too.

It promises personalized insurance recommendations that could save you thousands of dollars when you need it most.

Check it out here: https://www.hyppohealth.com

Warm regards`;

    // Create the mailto URL
    const mailtoUrl = `mailto:${referralForm.friendEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open the email client
    window.location.href = mailtoUrl;
    
    // Show success message and reset form
    setSnackbar({
      open: true,
      message: 'Email client opened! Send more referrals to help your friends save money!',
      severity: 'success'
    });
    
    // Reset form for next referral
    setReferralForm({
      friendName: '',
      friendEmail: ''
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Payment Successful!
      </Typography>
      <Typography variant="body1" gutterBottom>
        Thank you for your payment. Your personalized insurance plan is being processed and will be delivered to your email within 24-48 hours.
      </Typography>

      {!showReferral ? (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Know someone who could save money on health insurance?
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setShowReferral(true)}
            startIcon={<EmailIcon />}
            sx={{ mr: 2 }}
          >
            Help Friends Save Money
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </Button>
        </Box>
      ) : (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Help your friends save money on health insurance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your friend's details below. You can refer multiple friends by submitting one at a time.
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Friend's Name"
                name="friendName"
                value={referralForm.friendName}
                onChange={handleReferralChange}
                placeholder="Enter your friend's name"
              />
              <TextField
                fullWidth
                label="Friend's Email"
                name="friendEmail"
                type="email"
                value={referralForm.friendEmail}
                onChange={handleReferralChange}
                placeholder="Enter your friend's email"
              />
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendReferral}
                  disabled={!referralForm.friendName || !referralForm.friendEmail}
                  startIcon={<EmailIcon />}
                  sx={{ mr: 2 }}
                >
                  Send Referral
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowReferral(false);
                    setReferralForm({ friendName: '', friendEmail: '' });
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Success;