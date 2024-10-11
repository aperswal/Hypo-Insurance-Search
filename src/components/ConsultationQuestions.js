// src/components/ConsultationQuestions.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, TextField, Radio, RadioGroup, 
  FormControlLabel, FormControl, FormLabel, LinearProgress, 
  Chip, InputAdornment, Select, MenuItem, List, ListItem, ListItemIcon, ListItemText,
  Snackbar, Alert
} from '@mui/material';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckIcon from '@mui/icons-material/Check';

import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const ConsultationQuestions = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [showFinalPage, setShowFinalPage] = useState(false);

  const handleAnswer = (id, value, memberIndex = -1) => {
    setAnswers(prevAnswers => {
      if (memberIndex === -1) {
        return { ...prevAnswers, [id]: value };
      } else {
        const updatedMembers = [...(prevAnswers.householdMembers || [])];
        if (!updatedMembers[memberIndex]) {
          updatedMembers[memberIndex] = {};
        }
        updatedMembers[memberIndex] = { ...updatedMembers[memberIndex], [id]: value };
        return { ...prevAnswers, householdMembers: updatedMembers };
      }
    });
  };

  const mainQuestions = [
    { 
      id: 'firstName', 
      question: 'What is your first name?', 
      type: 'text',
      validation: (value) => value.trim() !== '',
      errorMessage: 'Please enter your first name',
      reward: "Great! We'll use your name to personalize your experience.",
      reason: "Your name helps us personalize our communication and recommendations for you."
    },
    { 
      id: 'lastName', 
      question: 'What is your last name?', 
      type: 'text',
      validation: (value) => value.trim() !== '',
      errorMessage: 'Please enter your last name',
      reward: 'Thank you! This helps us create a more personalized plan for you.',
      reason: "Your full name is important for accurate record-keeping and personalized service."
    },
    { 
      id: 'email', 
      question: 'What is your email address?', 
      type: 'email',
      validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      errorMessage: 'Please enter a valid email address',
      reward: "Perfect! We'll use this to send you your personalized plan.",
      reason: "We'll use your email to send you important information about your insurance options and updates."
    },
    { 
      id: 'zipCode', 
      question: 'What is your ZIP code?', 
      type: 'text',
      validation: (value) => /^\d{5}$/.test(value),
      errorMessage: 'Please enter a valid 5-digit ZIP code',
      reward: 'Great! Your location helps us find plans available in your area.',
      reason: "Insurance options and prices vary by location, so we need your ZIP code to show you accurate plans."
    },
    { 
      id: 'income', 
      question: 'What is your estimated household income for the coverage year?', 
      type: 'number',
      format: 'currency',
      validation: (value) => value > 0,
      errorMessage: 'Please enter a valid income amount',
      reward: 'Thank you! Your income helps determine if you qualify for savings on health coverage.',
      reason: "Your household income is used to calculate potential subsidies and tax credits you may be eligible for."
    },
    { 
      id: 'householdSize', 
      question: 'How many people are in your household, including yourself?', 
      type: 'number',
      validation: (value) => value > 0 && value < 20,
      errorMessage: 'Please enter a valid household size (1-19)',
      reward: 'Great! This information helps us calculate potential savings for your family.',
      reason: 'Household size affects your eligibility for certain plans and subsidies.'
    },
    { 
      id: 'monthlyBudget',
      question: 'How much can you comfortably spend on health insurance per month?',
      type: 'number',
      format: 'currency',
      validation: (value) => value >= 0,
      errorMessage: 'Please enter a valid amount',
      reward: 'This helps us find plans that fit your budget.',
      reason: "Understanding your budget helps us recommend plans that are affordable for you."
    },
    {
      id: 'emergencyFund',
      question: 'How much could you pay for an unexpected medical emergency?',
      type: 'number',
      format: 'currency',
      validation: (value) => value >= 0,
      errorMessage: 'Please enter a valid amount',
      reward: 'This helps us recommend plans with appropriate out-of-pocket maximums.',
      reason: "This information helps us suggest plans with deductibles and out-of-pocket maximums that align with your financial situation."
    },
    {
      id: 'coverageYear',
      question: 'For which year do you need coverage?',
      type: 'select',
      options: ['2023', '2024'],
      reward: 'This helps us find the most up-to-date plans for your needs.',
      reason: "Insurance plans and prices can change each year, so we need to know which year you're planning for."
    },
    {
      id: 'market',
      question: 'What type of coverage are you looking for?',
      type: 'select',
      options: ['Individual', 'SHOP'],
      reward: 'This helps us narrow down the right type of plans for you.',
      reason: "Different markets offer different types of plans. Individual plans are for personal coverage, while SHOP plans are for small businesses."
    }
  ];

  const personalQuestions = [
    { 
      id: 'age', 
      question: 'What is your age?', 
      type: 'number',
      validation: (value) => value >= 0 && value < 120,
      errorMessage: 'Please enter a valid age (0-119)',
      reward: 'Thank you! Age helps determine which plans are available.',
      reason: 'Age is a crucial factor in determining health insurance premiums and coverage options.'
    },
    { 
      id: 'sex', 
      question: 'What is your sex?', 
      type: 'select',
      options: ['Male', 'Female'],
      reward: 'This information helps provide more accurate plan options.',
      reason: 'Some health plans may offer specific benefits based on sex-specific health needs.'
    },
    {
      id: 'eligibleForCoverage',
      question: 'Are you eligible for health coverage through a job, Medicare, Medicaid, or CHIP?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This helps us determine if you qualify for marketplace insurance or other programs.',
      reason: 'Eligibility for other health coverage affects your options and potential subsidies in the marketplace.'
    },
    {
      id: 'legalGuardian',
      question: 'Are you a legal parent or guardian of a child under 19?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This information helps us determine if you qualify for certain family plans.',
      reason: 'Being a legal guardian can affect eligibility for family coverage and certain subsidies.'
    },
    {
      id: 'pregnant',
      question: 'Are you pregnant?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'Pregnancy status helps us find plans with appropriate maternity coverage.',
      reason: 'Pregnancy requires specific health coverage, and it may affect eligibility for certain programs.'
    },
    { 
      id: 'tobacco', 
      question: 'Do you use tobacco?', 
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This information helps insurers provide more accurate quotes.',
      reason: 'Tobacco use can significantly affect insurance premiums and coverage options.'
    },
    {
      id: 'specialNeeds',
      question: 'Do you have any special medical coverage needs?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This helps us identify plans that cover specific medical needs.',
      reason: 'Special medical needs may require specific types of coverage or affect plan recommendations.'
    },
    {
      id: 'prescriptionDrugs',
      question: 'Do you take any prescription medications regularly?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This information helps us find plans with appropriate prescription drug coverage.',
      reason: 'Regular medication needs can significantly impact which health plans are most cost-effective for you.'
    }
  ];

  const memberQuestions = [
    { 
      id: 'age', 
      question: 'What is the age of this household member?', 
      type: 'number',
      validation: (value) => value >= 0 && value < 120,
      errorMessage: 'Please enter a valid age (0-119)',
      reward: 'Thank you! Age helps determine which plans are available.',
      reason: 'Age is a crucial factor in determining health insurance premiums and coverage options.'
    },
    { 
      id: 'sex', 
      question: 'What is the sex of this household member?', 
      type: 'select',
      options: ['Male', 'Female'],
      reward: 'This information helps provide more accurate plan options.',
      reason: 'Some health plans may offer specific benefits based on sex-specific health needs.'
    },
    {
      id: 'eligibleForCoverage',
      question: 'Is this member eligible for health coverage through a job, Medicare, Medicaid, or CHIP?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This helps us determine if you qualify for marketplace insurance or other programs.',
      reason: 'Eligibility for other health coverage affects your options and potential subsidies in the marketplace.'
    },
    {
      id: 'pregnant',
      question: 'Is this member pregnant?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'Pregnancy status helps us find plans with appropriate maternity coverage.',
      reason: 'Pregnancy requires specific health coverage, and it may affect eligibility for certain programs.'
    },
    { 
      id: 'tobacco', 
      question: 'Does this household member use tobacco?', 
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This information helps insurers provide more accurate quotes.',
      reason: 'Tobacco use can significantly affect insurance premiums and coverage options.'
    },
    {
      id: 'specialNeeds',
      question: 'Does this member have any special medical coverage needs?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This helps us identify plans that cover specific medical needs.',
      reason: 'Special medical needs may require specific types of coverage or affect plan recommendations.'
    },
    {
      id: 'prescriptionDrugs',
      question: 'Does this member take any prescription medications regularly?',
      type: 'radio',
      options: ['Yes', 'No'],
      reward: 'This information helps us find plans with appropriate prescription drug coverage.',
      reason: 'Regular medication needs can significantly impact which health plans are most cost-effective for you.'
    }
  ];

  // Memoize handleNext to prevent unnecessary re-renders and to satisfy useEffect dependencies
  const handleNext = useCallback(() => {
    const currentQuestions = step < mainQuestions.length ? mainQuestions :
                             step < mainQuestions.length + personalQuestions.length ? personalQuestions :
                             memberQuestions;
    const currentQuestion = currentQuestions[step % currentQuestions.length];
    
    if (!currentQuestion) {
      setShowFinalPage(true);
      return;
    }

    const memberIndex = step >= mainQuestions.length + personalQuestions.length ?
                        Math.floor((step - mainQuestions.length - personalQuestions.length) / memberQuestions.length) :
                        -1;

    const currentAnswer = memberIndex === -1 ? answers[currentQuestion.id] :
                          answers.householdMembers && answers.householdMembers[memberIndex] ?
                          answers.householdMembers[memberIndex][currentQuestion.id] : undefined;

    if (!currentAnswer) {
      setError(`Please answer the question before proceeding.`);
      return;
    }

    if (currentQuestion.validation && !currentQuestion.validation(currentAnswer)) {
      setError(currentQuestion.errorMessage);
      return;
    }

    if (currentQuestion.id === 'prescriptionDrugs' && currentAnswer === 'Yes') {
      const drugsList = memberIndex === -1 ? answers.prescriptionDrugsList :
                        answers.householdMembers[memberIndex].prescriptionDrugsList;
      if (!drugsList) {
        setError('Please list the prescription medications before proceeding.');
        return;
      }
    }

    if (currentQuestion.id === 'specialNeeds' && currentAnswer === 'Yes') {
      const needsList = memberIndex === -1 ? answers.specialNeedsList :
                        answers.householdMembers[memberIndex].specialNeedsList;
      if (!needsList) {
        setError('Please describe the special medical coverage needs before proceeding.');
        return;
      }
    }

    const totalQuestions = mainQuestions.length + personalQuestions.length +
                           (answers.householdSize ? (answers.householdSize - 1) * memberQuestions.length : 0);

    if (step < totalQuestions - 1) {
      setStep(step + 1);
    } else {
      setShowFinalPage(true);
    }
    setError('');
  }, [step, answers]);

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating checkout session:', errorData);
        setError('Failed to create checkout session. Please try again.');
        return;
      }

      const session = await response.json();

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        console.error(result.error.message);
        setError(result.error.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const formatCurrency = (value) => {
    const number = parseFloat(value);
    return isNaN(number) ? '' : number.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const handleCurrencyChange = (e, id, memberIndex = -1) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    handleAnswer(id, value, memberIndex);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        handleNext();
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleNext]);

  const renderQuestionContent = () => {
    const currentQuestions = step < mainQuestions.length ? mainQuestions :
                             step < mainQuestions.length + personalQuestions.length ? personalQuestions :
                             memberQuestions;
    const currentQuestion = currentQuestions[step % currentQuestions.length];

    if (!currentQuestion) {
      return null;
    }

    const memberIndex = step >= mainQuestions.length + personalQuestions.length ?
                        Math.floor((step - mainQuestions.length - personalQuestions.length) / memberQuestions.length) :
                        -1;

    const currentAnswer = memberIndex === -1 ? answers[currentQuestion.id] :
                          answers.householdMembers && answers.householdMembers[memberIndex] ?
                          answers.householdMembers[memberIndex][currentQuestion.id] : undefined;

    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          {memberIndex === -1 ? "Your Information" : `Household Member ${memberIndex + 2}`}
        </Typography>
        <FormControl component="fieldset" sx={{ mt: 2, width: '100%' }}>
          <FormLabel component="legend">{currentQuestion.question}</FormLabel>
          {currentQuestion.type === 'radio' ? (
            <RadioGroup
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value, memberIndex)}
            >
              {currentQuestion.options.map(option => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
          ) : currentQuestion.type === 'select' ? (
            <Select
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value, memberIndex)}
              fullWidth
              sx={{ mt: 1 }}
            >
              {currentQuestion.options.map(option => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          ) : currentQuestion.type === 'number' && currentQuestion.format === 'currency' ? (
            <TextField
              fullWidth
              type="text"
              value={formatCurrency(currentAnswer || '')}
              onChange={(e) => handleCurrencyChange(e, currentQuestion.id, memberIndex)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mt: 1 }}
            />
          ) : (
            <TextField
              fullWidth
              type={currentQuestion.type}
              value={currentAnswer || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value, memberIndex)}
              sx={{ mt: 1 }}
            />
          )}
        </FormControl>
        
        {/* Render follow-up questions if applicable */}
        {currentQuestion.id === 'prescriptionDrugs' && currentAnswer === 'Yes' && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Please list the prescription medications:"
            value={memberIndex === -1 ? answers.prescriptionDrugsList || '' : 
                   answers.householdMembers[memberIndex].prescriptionDrugsList || ''}
            onChange={(e) => handleAnswer('prescriptionDrugsList', e.target.value, memberIndex)}
            sx={{ mt: 2 }}
          />
        )}
        {currentQuestion.id === 'specialNeeds' && currentAnswer === 'Yes' && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Please describe the special medical coverage needs:"
            value={memberIndex === -1 ? answers.specialNeedsList || '' : 
                  answers.householdMembers[memberIndex].specialNeedsList || ''}
            onChange={(e) => handleAnswer('specialNeedsList', e.target.value, memberIndex)}
            sx={{ mt: 2 }}
          />
        )}

        {currentAnswer && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <CheckCircleOutlineIcon sx={{ mr: 1 }} />
            <Typography variant="body2">{currentQuestion.reward}</Typography>
          </Box>
        )}
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
          Why we ask: {currentQuestion.reason}
        </Typography>
      </Box>
    );
  };

  const renderFinalPage = () => (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        You're One Step Away from Saving Hundreds on Your Health Insurance
      </Typography>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Unlock Your Personalized Health Insurance Plan for Just $10
      </Typography>
      <Typography variant="body1" paragraph>
        Are you tired of:
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon><CheckIcon color="error" /></ListItemIcon>
          <ListItemText primary="Overpaying for health insurance that doesn't fit your needs?" />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckIcon color="error" /></ListItemIcon>
          <ListItemText primary="Spending hours comparing complex insurance plans?" />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckIcon color="error" /></ListItemIcon>
          <ListItemText primary="Worrying about unexpected medical costs?" />
        </ListItem>
      </List>
      <Typography variant="body1" paragraph sx={{ mt: 3 }}>
        For just $10, you'll receive:
      </Typography>
      <List>
        <ListItem>
          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
          <ListItemText primary="A personalized report of the best insurance plans for your unique situation" />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
          <ListItemText primary="Potential savings of hundreds of dollars on your monthly premiums" />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
          <ListItemText primary="Expert analysis that could save you thousands in out-of-pocket costs" />
        </ListItem>
        <ListItem>
          <ListItemIcon><CheckIcon color="success" /></ListItemIcon>
          <ListItemText primary="Peace of mind knowing you have the right coverage for you and your family" />
        </ListItem>
      </List>
      <Typography variant="body1" sx={{ mt: 3, fontWeight: 'bold' }}>
        Don't miss this opportunity to secure the best health insurance for your needs and budget.
      </Typography>
      <Button 
        onClick={handleComplete} 
        variant="contained" 
        color="primary" 
        size="large"
        sx={{ 
          mt: 4,
          minWidth: 200, 
          fontSize: '1.1rem',
          fontWeight: 'bold',
          textTransform: 'none'
        }}
      >
        Get Your Personalized Plan for $10
      </Button>
    </Box>
  );

  const totalQuestions = mainQuestions.length + personalQuestions.length +
                         (answers.householdSize ? (answers.householdSize - 1) * memberQuestions.length : 0);

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      {showFinalPage ? renderFinalPage() : renderQuestionContent()}
      {!showFinalPage && (
        <>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack} variant="outlined" disabled={step === 0}>
              Back
            </Button>
            <Button onClick={handleNext} variant="contained">
              {step < totalQuestions - 1 ? 'Next' : 'Finish'}
            </Button>
          </Box>
          <Box sx={{ mt: 4 }}>
            <LinearProgress
              variant="determinate"
              value={(step + 1) / totalQuestions * 100}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 1 }}>
              {[...Array(totalQuestions)].map((_, index) => (
                <Chip
                  key={index}
                  label={index + 1}
                  color={index <= step ? 'primary' : 'default'}
                  size="small"
                  sx={{ m: 0.5 }}
                />
              ))}
            </Box>
          </Box>
        </>
      )}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConsultationQuestions;
