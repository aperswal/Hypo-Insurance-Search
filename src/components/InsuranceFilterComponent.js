import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Slider,
  TextField,
  Button,
  Box,
  Grid,
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList'; // Add this line

import { Paper, IconButton } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BusinessIcon from '@mui/icons-material/Business';
import GradeIcon from '@mui/icons-material/Grade';

  const InsuranceFilterComponent = ({ 
    onFilterChange, 
    filterOptions = {}, 
    minPremium = 0, 
    maxPremium = 2000,
    minDeductible = 0,
    maxDeductible = 10000
  }) => {
    const {
      issuers = [],
      planTypes = [],
      metalLevels = []
    } = filterOptions;

    const [filters, setFilters] = useState({
      metalLevels: [],
      planTypes: [],
      issuers: [],
      premium: [minPremium, maxPremium],
      deductible: [minDeductible, maxDeductible],
      hsaEligible: false,
      hasNationalNetwork: false
    });

  useEffect(() => {
    setFilters(prevFilters => ({
      ...prevFilters,
      premium: [minPremium, maxPremium],
      deductible: [minDeductible, maxDeductible]
    }));
  }, [minPremium, maxPremium, minDeductible, maxDeductible]);


  const handleCheckboxChange = (category, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [category]: prevFilters[category].includes(value)
        ? prevFilters[category].filter(item => item !== value)
        : [...prevFilters[category], value]
    }));
  };

  const handleSliderChange = (name, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleBooleanChange = (name, event) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: event.target.checked
    }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  return (
    <Paper elevation={3} sx={{ mb: 3, mt: 4, p: 2, borderRadius: 2 }}>
      <Accordion
        sx={{
          bgcolor: 'transparent',
          boxShadow: 'none',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 1,
            '&:hover': { bgcolor: 'primary.dark' },
          }}
        >
          <Typography variant="h6">Filter Insurance Plans</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <GradeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Metal Levels</Typography>
              </Box>
              <FormGroup>
                {metalLevels.map(level => (
                  <FormControlLabel
                    key={level}
                    control={
                      <Checkbox
                        checked={filters.metalLevels.includes(level)}
                        onChange={() => handleCheckboxChange('metalLevels', level)}
                      />
                    }
                    label={level}
                  />
                ))}
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <LocalHospitalIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Plan Types</Typography>
              </Box>
              <FormGroup>
                {planTypes.map(type => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        checked={filters.planTypes.includes(type)}
                        onChange={() => handleCheckboxChange('planTypes', type)}
                      />
                    }
                    label={type}
                  />
                ))}
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <BusinessIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Issuers</Typography>
              </Box>
              <FormGroup>
                {issuers.map(issuer => (
                  <FormControlLabel
                    key={issuer}
                    control={
                      <Checkbox
                        checked={filters.issuers.includes(issuer)}
                        onChange={() => handleCheckboxChange('issuers', issuer)}
                      />
                    }
                    label={issuer}
                  />
                ))}
              </FormGroup>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hsaEligible}
                    onChange={(e) => handleBooleanChange('hsaEligible', e)}
                  />
                }
                label="HSA Eligible"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.hasNationalNetwork}
                    onChange={(e) => handleBooleanChange('hasNationalNetwork', e)}
                  />
                }
                label="Has National Network"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Monthly Premium Range</Typography>
              </Box>
              <Slider
                value={filters.premium}
                onChange={(_, newValue) => handleSliderChange('premium', newValue)}
                valueLabelDisplay="auto"
                min={minPremium}
                max={maxPremium}
                sx={{ color: 'secondary.main' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <TextField
                  size="small"
                  value={filters.premium[0]}
                  onChange={(e) => handleSliderChange('premium', [parseInt(e.target.value), filters.premium[1]])}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: minPremium, max: maxPremium }
                  }}
                />
                <TextField
                  size="small"
                  value={filters.premium[1]}
                  onChange={(e) => handleSliderChange('premium', [filters.premium[0], parseInt(e.target.value)])}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: minPremium, max: maxPremium }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={1}>
                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Deductible Range</Typography>
              </Box>
              <Slider
                value={filters.deductible}
                onChange={(_, newValue) => handleSliderChange('deductible', newValue)}
                valueLabelDisplay="auto"
                min={minDeductible}
                max={maxDeductible}
                sx={{ color: 'secondary.main' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <TextField
                  size="small"
                  value={filters.deductible[0]}
                  onChange={(e) => handleSliderChange('deductible', [parseInt(e.target.value), filters.deductible[1]])}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: minDeductible, max: maxDeductible }
                  }}
                />
                <TextField
                  size="small"
                  value={filters.deductible[1]}
                  onChange={(e) => handleSliderChange('deductible', [filters.deductible[0], parseInt(e.target.value)])}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    inputProps: { min: minDeductible, max: maxDeductible }
                  }}
                />
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={applyFilters}
              startIcon={<FilterListIcon />}
              sx={{ borderRadius: 20, px: 4 }}
            >
              Apply Filters
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default InsuranceFilterComponent;