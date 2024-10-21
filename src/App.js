// src/App.js

import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Grid, 
  Paper 
} from '@mui/material';
import InsuranceSearchForm from './components/InsuranceSearchForm';
import InsuranceFilterComponent from './components/InsuranceFilterComponent';
import InsuranceSortComponent from './components/InsuranceSortComponent';
import InsurancePlanList from './components/InsurancePlanList';
import InsuranceConsultationBox from './components/InsuranceConsultationBox';
import ConsultationQuestions from './components/ConsultationQuestions';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Success from './pages/Success';
import Cancel from './pages/Cancel';


function App() {
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

  const [insuranceFilterOptions, setInsuranceFilterOptions] = useState({
    issuers: [],
    planTypes: [],
    metalLevels: []
  });

  const handleStartConsultation = () => {
    setShowConsultation(true);
  };

  const handleCloseConsultation = () => {
    setShowConsultation(false);
  };

  const handleConsultationComplete = async (answers) => {
    console.log('Consultation Answers:', answers); // Debugging
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

      console.log('CMS API Request Body:', requestBody); // Debugging

      const response = await fetch('/api/insurance-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('CMS API Response:', data); // Debugging

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(data)}`);
      }

      if (!data.plans || !Array.isArray(data.plans)) {
        throw new Error('Invalid response format: plans array is missing or not an array');
      }

      setInsurancePlans(data.plans);
      setFilteredInsurancePlans(data.plans);

      // Update filter options based on the new plans
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

  useEffect(() => {
    if (insurancePlans) {
      const issuers = [...new Set(insurancePlans.map(plan => plan.issuer.name))];
      const planTypes = [...new Set(insurancePlans.map(plan => plan.type))];
      const metalLevels = [...new Set(insurancePlans.map(plan => plan.metal_level))];
      setInsuranceFilterOptions({ issuers, planTypes, metalLevels });
    }
  }, [insurancePlans]);

  useEffect(() => {
    if (insurancePlans && insurancePlans.length > 0) {
      const premiums = insurancePlans.map(plan => plan.premium);
      const deductibles = insurancePlans.map(plan => plan.deductibles[0].amount);
      
      setMinPremium(Math.min(...premiums));
      setMaxPremium(Math.max(...premiums));
      setMinDeductible(Math.min(...deductibles));
      setMaxDeductible(Math.max(...deductibles));
    }
  }, [insurancePlans]);

  const handleInsuranceSearch = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Sending request with data:', formData); // Log the request data
      const response = await fetch('/api/insurance-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      const data = await response.json();
      setInsurancePlans(data.plans);
      setFilteredInsurancePlans(data.plans);
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
      setError(`An error occurred while fetching insurance plans: ${error.message}`);
      setInsurancePlans(null);
      setFilteredInsurancePlans(null);
    }
    setLoading(false);
  };

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
    // Removed usage of insuranceSortCriteria
    // setInsuranceSortCriteria(criteria);
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

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Container maxWidth="md" className="App">
              <Box className="app-header">
                <Typography variant="h3" component="h1" className="app-title">
                  Find Your Perfect Insurance Plan
                </Typography>
                <Typography variant="h6" className="app-subtitle">
                  Compare top-rated plans and save on your health insurance
                </Typography>
              </Box>

              {!showConsultation && (
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
                    <Box className="error-container">
                      <Typography color="error">{error}</Typography>
                    </Box>
                  )}

                  {filteredInsurancePlans && (
                    <Box className="available-plans">
                      <Typography variant="h5" gutterBottom>
                        Available Plans
                      </Typography>
                      <InsurancePlanList plans={filteredInsurancePlans} />
                    </Box>
                  )}

                  <Box className="help-text">
                    <Typography variant="body1">
                      Need help choosing a plan? Our experts are just a call away.
                    </Typography>
                  </Box>
                </>
              )}

              {showConsultation && (
                <Box className="consultation-container">
                  <ConsultationQuestions
                    onClose={handleCloseConsultation}
                    onComplete={handleConsultationComplete}
                  />
                </Box>
              )}

              {!showConsultation && !consultationAnswers && (
                <InsuranceConsultationBox onStartConsultation={handleStartConsultation} />
              )}
            </Container>
          }
        />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
      </Routes>
    </Router>
  );
}

export default App;
