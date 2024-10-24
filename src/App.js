import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Grid, 
  Paper 
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import InsuranceSearchForm from './components/InsuranceSearchForm';
import InsuranceFilterComponent from './components/InsuranceFilterComponent';
import InsuranceSortComponent from './components/InsuranceSortComponent';
import InsurancePlanList from './components/InsurancePlanList';
import ConsultationQuestions from './components/ConsultationQuestions';
import ConsultationPopup from './components/ConsultationPopup';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import './App.css';

function App() {
  // Referenced from App.js lines 22-39 for state declarations
  const [consultationAnswers, setConsultationAnswers] = useState(null);
  const [showConsultation, setShowConsultation] = useState(false);
  const [insurancePlans, setInsurancePlans] = useState(null);
  const [filteredInsurancePlans, setFilteredInsurancePlans] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [minPremium, setMinPremium] = useState(0);
  const [maxPremium, setMaxPremium] = useState(2000);
  const [minDeductible, setMinDeductible] = useState(0);
  const [maxDeductible, setMaxDeductible] = useState(10000);
  const [showPopup, setShowPopup] = useState(false);
  const [isPopupMinimized, setIsPopupMinimized] = useState(false);

  const [insuranceFilterOptions, setInsuranceFilterOptions] = useState({
    issuers: [],
    planTypes: [],
    metalLevels: []
  });

  const navigate = useNavigate();

  // Show popup after 20 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!showConsultation && !consultationAnswers) {
        setShowPopup(true);
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, [showConsultation, consultationAnswers]);

  const handleClosePopup = () => {
    setIsPopupMinimized(true);
    setShowPopup(false);
  };

  const handleChatClick = () => {
    setIsPopupMinimized(false);
    setShowPopup(true);
  };

  const handlePopupConsultation = () => {
    setShowPopup(false);
    setIsPopupMinimized(false);
    setShowConsultation(true);
  };

  // Referenced from App.js lines 65-195 for all handler functions
  const handleConsultationComplete = async (answers) => {
    console.log('Consultation Answers:', answers);
    setConsultationAnswers(answers);
    setShowConsultation(false);
    await fetchInsurancePlansFromConsultation(answers);
  };

  const fetchInsurancePlansFromConsultation = async (answers) => {
    setLoading(true);
    setError(null);
    try {
      const requestBody = {
        zipCode: answers.zipCode,
        income: answers.income,
        householdSize: answers.householdSize,
        age: answers.age,
        gender: answers.gender,
        tobacco: answers.tobacco === 'Yes',
        coverageYear: answers.coverageYear,
        market: answers.market,
        aptcEligible: answers.aptcEligible === 'Yes'
      };

      const response = await fetch('/api/insurance-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
      }

      if (!data.plans || !Array.isArray(data.plans)) {
        throw new Error('Invalid response format: plans array is missing or not an array');
      }

      setInsurancePlans(data.plans);
      setFilteredInsurancePlans(data.plans);
      updateFilterOptions(data.plans);
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
      setError(`An error occurred while fetching insurance plans: ${error.message}`);
      setInsurancePlans(null);
      setFilteredInsurancePlans(null);
    } finally {
      setLoading(false);
    }
  };

  // Referenced from App.js lines 119-195 for filter and sort handlers
  const updateFilterOptions = (plans) => {
    const issuers = [...new Set(plans.map(plan => plan.issuer.name))];
    const planTypes = [...new Set(plans.map(plan => plan.type))];
    const metalLevels = [...new Set(plans.map(plan => plan.metal_level))];
    setInsuranceFilterOptions({ issuers, planTypes, metalLevels });

    const premiums = plans.map(plan => plan.premium);
    const deductibles = plans.map(plan => plan.deductibles[0].amount);
    
    setMinPremium(Math.min(...premiums));
    setMaxPremium(Math.max(...premiums));
    setMinDeductible(Math.min(...deductibles));
    setMaxDeductible(Math.max(...deductibles));
  };

  // Referenced from App.js lines 134-195 for search, filter, and sort handlers
  const handleInsuranceSearch = async (formData) => {
    setLoading(true);
    setError(null);  // Clear any existing error
    setInsurancePlans(null);  // Clear existing plans
    setFilteredInsurancePlans(null);  // Clear filtered plans
    setInsuranceFilterOptions({
      issuers: [],
      planTypes: [],
      metalLevels: []
    });
    
    try {
      if (!formData.zipCode || !formData.state || !formData.county) {
        throw new Error('Please ensure all location information is provided');
      }
  
      const response = await fetch('/api/insurance-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        let errorMessage = 'Unable to find insurance plans. ';
        
        if (data.apiResponse?.code === '1003') {
          errorMessage += 'The ZIP code you entered does not match the selected state and county. Please verify your location information.';
        } else if (data.apiResponse?.message) {
          errorMessage += data.apiResponse.message;
        } else {
          errorMessage += 'Please check your information and try again.';
        }
        
        throw new Error(errorMessage);
      }
  
      if (!data.plans || !Array.isArray(data.plans)) {
        throw new Error('No insurance plans found for your criteria. Please modify your search and try again.');
      }
  
      if (data.plans.length === 0) {
        throw new Error('No insurance plans available in your area. Please try a different location or modify your search criteria.');
      }
  
      setInsurancePlans(data.plans);
      setFilteredInsurancePlans(data.plans);
      updateFilterOptions(data.plans);
    } catch (error) {
      console.error('Error in insurance search:', error);
      
      let userMessage = '';
      if (error.message.includes('API key')) {
        userMessage = 'We\'re experiencing technical difficulties. Please try again later.';
      } else if (error.message.includes('zipcode')) {
        userMessage = 'Please verify that your ZIP code matches your selected state and county.';
      } else if (error.message.includes('No insurance plans')) {
        userMessage = error.message;
      } else {
        userMessage = 'Unable to complete your search. Please verify your information and try again.';
      }
      
      setError(
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Search Error
          </Typography>
          <Typography variant="body1">
            {userMessage}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Need help? Contact our support team.
          </Typography>
        </Box>
      );
    } finally {
      setLoading(false);
    }
  };

  // Referenced from App.js lines 162-195 for filter and sort handlers
  const handleInsuranceFilterChange = (filters) => {
    const filtered = insurancePlans.filter(plan => {
      return (
        (filters.metalLevels.length === 0 || filters.metalLevels.includes(plan.metal_level)) &&
        (filters.planTypes.length === 0 || filters.planTypes.includes(plan.type)) &&
        (filters.issuers.length === 0 || filters.issuers.includes(plan.issuer.name)) &&
        plan.premium >= filters.premium[0] && plan.premium <= filters.premium[1] &&
        plan.deductibles[0].amount >= filters.deductible[0] && plan.deductibles[0].amount <= filters.deductible[1] &&
        (!filters.hsaEligible || plan.hsa_eligible) &&
        (!filters.hasNationalNetwork || plan.has_national_network)
      );
    });
    setFilteredInsurancePlans(filtered);
  };

  const handleInsuranceSort = (criteria) => {
    const sorted = [...filteredInsurancePlans].sort((a, b) => {
      switch (criteria) {
        case 'premium_asc':
          return a.premium - b.premium;
        case 'premium_desc':
          return b.premium - a.premium;
        case 'deductible_asc':
          return (a.deductibles[0]?.amount || 0) - (b.deductibles[0]?.amount || 0);
        case 'deductible_desc':
          return (b.deductibles[0]?.amount || 0) - (a.deductibles[0]?.amount || 0);
        case 'rating_desc':
          return (b.quality_rating?.global_rating || 0) - (a.quality_rating?.global_rating || 0);
        default:
          return 0;
      }
    });
    setFilteredInsurancePlans(sorted);
  };

  // Referenced from App.js lines 197-293 for the return statement
  return (
    <Container maxWidth="md" className="App">
      <Box 
        className="app-header"
        onClick={() => {
          if (showConsultation) {
            setShowConsultation(false);
            setConsultationAnswers(null);
            setShowPopup(true);
            setIsPopupMinimized(false);
          }
        }}
        sx={{
          cursor: showConsultation ? 'pointer' : 'default',
          '&:hover': {
            opacity: showConsultation ? 0.8 : 1
          },
          transition: 'opacity 0.2s ease'
        }}
      >
        <Typography variant="h3" component="h1" className="app-title">
          Find Your Perfect Insurance Plan
        </Typography>
        <Typography variant="h6" className="app-subtitle">
          Compare top-rated plans and save on your health insurance
        </Typography>
      </Box>

      {showConsultation ? (
        <Box className="consultation-container">
          <ConsultationQuestions
            onClose={() => setShowConsultation(false)}
            onComplete={handleConsultationComplete}
          />
        </Box>
      ) : (
        <>
          <Box className="search-form-container">
            <InsuranceSearchForm onSubmit={handleInsuranceSearch} />
          </Box>

          {insurancePlans && (
            <Paper elevation={3} sx={{ mb: 3, mt: 4, p: 2, borderRadius: 2 }}>
              <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Customize Your Results
              </Typography>
              <Grid container spacing={3} direction="column">
                <Grid item xs={12}>
                  <InsuranceFilterComponent
                    onFilterChange={handleInsuranceFilterChange}
                    filterOptions={insuranceFilterOptions}
                    minPremium={minPremium}
                    maxPremium={maxPremium}
                    minDeductible={minDeductible}
                    maxDeductible={maxDeductible}
                  />
                </Grid>
                <Grid item xs={12}>
                  <InsuranceSortComponent onSortChange={handleInsuranceSort} />
                </Grid>
              </Grid>
            </Paper>
          )}

          {loading && (
            <Box className="loading-container">
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Paper 
              elevation={3} 
              sx={{ 
                mt: 2, 
                mb: 3, 
                p: 2, 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'error.light',
                backgroundColor: 'error.lighter'
              }}
            >
              {error}
            </Paper>
          )}

          {filteredInsurancePlans && (
            <Box className="available-plans">
              <Typography variant="h5" gutterBottom>
                Available Plans
              </Typography>
              <InsurancePlanList plans={filteredInsurancePlans} />
            </Box>
          )}
        </>
      )}

      {/* Consultation Popup */}
      {!showConsultation && !consultationAnswers && (showPopup || isPopupMinimized) && (
        <ConsultationPopup
          onClose={handleClosePopup}
          onStartConsultation={handlePopupConsultation}
          onChatClick={handleChatClick}
          isMinimized={isPopupMinimized}
        />
      )}
    </Container>
  );
}

// Referenced from App.js lines 296-309 for the AppWrapper
function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;