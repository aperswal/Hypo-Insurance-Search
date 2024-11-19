// src/components/InsuranceSearchForm.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Typography, 
  Checkbox, 
  FormControlLabel, 
  Paper, 
  IconButton, 
  Autocomplete,
  InputAdornment,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


const states = [
  { name: 'Alabama', abbreviation: 'AL' },
  { name: 'Alaska', abbreviation: 'AK' },
  { name: 'Arizona', abbreviation: 'AZ' },
  { name: 'Arkansas', abbreviation: 'AR' },
  { name: 'California', abbreviation: 'CA' },
  { name: 'Colorado', abbreviation: 'CO' },
  { name: 'Connecticut', abbreviation: 'CT' },
  { name: 'Delaware', abbreviation: 'DE' },
  { name: 'Florida', abbreviation: 'FL' },
  { name: 'Georgia', abbreviation: 'GA' },
  { name: 'Hawaii', abbreviation: 'HI' },
  { name: 'Idaho', abbreviation: 'ID' },
  { name: 'Illinois', abbreviation: 'IL' },
  { name: 'Indiana', abbreviation: 'IN' },
  { name: 'Iowa', abbreviation: 'IA' },
  { name: 'Kansas', abbreviation: 'KS' },
  { name: 'Kentucky', abbreviation: 'KY' },
  { name: 'Louisiana', abbreviation: 'LA' },
  { name: 'Maine', abbreviation: 'ME' },
  { name: 'Maryland', abbreviation: 'MD' },
  { name: 'Massachusetts', abbreviation: 'MA' },
  { name: 'Michigan', abbreviation: 'MI' },
  { name: 'Minnesota', abbreviation: 'MN' },
  { name: 'Mississippi', abbreviation: 'MS' },
  { name: 'Missouri', abbreviation: 'MO' },
  { name: 'Montana', abbreviation: 'MT' },
  { name: 'Nebraska', abbreviation: 'NE' },
  { name: 'Nevada', abbreviation: 'NV' },
  { name: 'New Hampshire', abbreviation: 'NH' },
  { name: 'New Jersey', abbreviation: 'NJ' },
  { name: 'New Mexico', abbreviation: 'NM' },
  { name: 'New York', abbreviation: 'NY' },
  { name: 'North Carolina', abbreviation: 'NC' },
  { name: 'North Dakota', abbreviation: 'ND' },
  { name: 'Ohio', abbreviation: 'OH' },
  { name: 'Oklahoma', abbreviation: 'OK' },
  { name: 'Oregon', abbreviation: 'OR' },
  { name: 'Pennsylvania', abbreviation: 'PA' },
  { name: 'Rhode Island', abbreviation: 'RI' },
  { name: 'South Carolina', abbreviation: 'SC' },
  { name: 'South Dakota', abbreviation: 'SD' },
  { name: 'Tennessee', abbreviation: 'TN' },
  { name: 'Texas', abbreviation: 'TX' },
  { name: 'Utah', abbreviation: 'UT' },
  { name: 'Vermont', abbreviation: 'VT' },
  { name: 'Virginia', abbreviation: 'VA' },
  { name: 'Washington', abbreviation: 'WA' },
  { name: 'West Virginia', abbreviation: 'WV' },
  { name: 'Wisconsin', abbreviation: 'WI' },
  { name: 'Wyoming', abbreviation: 'WY' }
];

const formatIncome = (value) => {
  const numericValue = value.replace(/[^0-9]/g, '');
  return numericValue ? `${parseInt(numericValue).toLocaleString()}` : '';
};

const InsuranceSearchForm = ({ onSubmit, onError }) => {
  const [formData, setFormData] = useState({
    income: '',
    zipCode: '',
    county: '',
    state: '',
    people: [{
      age: '',
      gender: '',
      eligibleForCoverage: false,
      legalGuardian: false,
      pregnant: false,
      tobaccoUser: false
    }],
    market: 'Individual',
    year: new Date().getFullYear()
  });

  const [counties, setCounties] = useState([]);
  const [error, setError] = useState(null); // Retained 'error' state

  useEffect(() => {
    if (formData.state) {
      fetchCounties(formData.state);
    }
  }, [formData.state]);

  const fetchCounties = async (stateAbbreviation) => {
    try {
      const response = await axios.get(`/api/counties/${stateAbbreviation}`, {
        timeout: 8000
      });
      
      if (Array.isArray(response.data)) {
        setCounties(response.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching counties:', error);
      let errorMessage = 'Failed to fetch counties. ';
      
      if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      onError(
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {errorMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can try selecting a different state or refreshing the page.
          </Typography>
        </Box>
      );
      setCounties([]);
    }
  };

  const validateForm = (formData) => {
    const errors = [];
    const income = parseInt(formData.income.replace(/[^0-9]/g, ''));
  
    // Validate income
    if (income < 0) {
      errors.push("Income cannot be negative");
    }
    if (income > 999999999) {
      errors.push("Please enter a valid income amount");
    }
  
    // Validate ZIP code
    if (!/^\d{5}$/.test(formData.zipCode)) {
      errors.push("Please enter a valid 5-digit ZIP code");
    }
  
    // Validate state and county
    if (!formData.state) {
      errors.push("Please select a state");
    }
    if (!formData.county) {
      errors.push("Please select a county");
    }
  
    // Validate people
    formData.people.forEach((person, index) => {
      const personNum = index + 1;
      const age = parseInt(person.age);
  
      if (isNaN(age) || age < 0 || age > 120) {
        errors.push(`Person ${personNum}: Please enter a valid age between 0 and 120`);
      }
  
      if (!person.gender) {
        errors.push(`Person ${personNum}: Please select a gender`);
      }
  
      if (person.pregnant && person.gender === 'Male') {
        errors.push(`Person ${personNum}: Males cannot be marked as pregnant`);
      }
      if (person.pregnant && (age < 12 || age > 60)) {
        errors.push(`Person ${personNum}: Please verify pregnancy status for the given age`);
      }
    });
  
    return errors;
  };
  
  const handleChange = (e, index) => {
    const { name, value, checked, type } = e.target;
    
    if (name === 'income') {
      setFormData({ ...formData, income: formatIncome(value) });
    } else if (name === 'zipCode' || name === 'county') {
      setFormData({ ...formData, [name]: value });
    } else if (name.includes('age') || name.includes('gender') || 
               name.includes('eligibleForCoverage') || name.includes('legalGuardian') || 
               name.includes('pregnant') || name.includes('tobaccoUser')) {
      const field = name.split('.').pop();
      const newPeople = [...formData.people];
      newPeople[index] = {
        ...newPeople[index],
        [field]: type === 'checkbox' ? checked : value
      };
      setFormData({ ...formData, people: newPeople });
    }
  };

  const handleStateChange = (event, newValue) => {
    setFormData({ ...formData, state: newValue ? newValue.abbreviation : '', county: '' });
  };

  const handleCountyChange = (event, newValue) => {
    setFormData({ ...formData, county: newValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      setError(
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Please correct the following:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Box>
      );
      return;
    }
  
    // Clear the error state when submitting a valid form
    setError(null);
  
    const submissionData = {
      ...formData,
      income: formData.income.replace(/[^0-9]/g, '')
    };
    onSubmit(submissionData);
  };

  const addPerson = () => {
    setFormData({
      ...formData,
      people: [...formData.people, {
        age: '',
        gender: '',
        eligibleForCoverage: false,
        legalGuardian: false,
        pregnant: false,
        tobaccoUser: false
      }]
    });
  };

  const removePerson = (index) => {
    const newPeople = formData.people.filter((_, i) => i !== index);
    setFormData({ ...formData, people: newPeople });
  };

  return (
    <>
      {error && (
        <Box sx={{ mb: 2 }}>
          {error}
        </Box>
      )}
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6">Household Information</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Household Income"
              name="income"
              value={formData.income}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />  
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="ZIP Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={states}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="State" required />}
              onChange={handleStateChange}
              value={states.find(state => state.abbreviation === formData.state) || null}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={counties}
              renderInput={(params) => <TextField {...params} label="County" required />}
              onChange={handleCountyChange}
              value={formData.county}
              disabled={!formData.state}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">Household Members</Typography>
          </Grid>
          {formData.people.map((person, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Age"
                      name={`person.${index}.age`}
                      type="number"
                      value={person.age}
                      onChange={(e) => handleChange(e, index)}
                      required
                      />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth required>
                      <InputLabel>Sex</InputLabel>
                      <Select
                        name={`person.${index}.gender`}
                        value={person.gender}
                        onChange={(e) => handleChange(e, index)}
                        label="Sex"
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={person.eligibleForCoverage}
                              onChange={(e) => handleChange(e, index)}
                              name={`person.${index}.eligibleForCoverage`}
                            />
                          }
                          label="Eligible for health coverage through a job, Medicare, Medicaid, or CHIP"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={person.legalGuardian}
                              onChange={(e) => handleChange(e, index)}
                              name={`person.${index}.legalGuardian`}
                            />
                          }
                          label="Legal parent or guardian of a child under 19 (claimed as a tax dependent)"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={person.pregnant}
                              onChange={(e) => handleChange(e, index)}
                              name={`person.${index}.pregnant`}
                            />
                          }
                          label="Pregnant"
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={person.tobaccoUser}
                              onChange={(e) => handleChange(e, index)}
                              name={`person.${index}.tobaccoUser`}
                            />
                          }
                          label="Tobacco user"
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  {formData.people.length > 1 && (
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton onClick={() => removePerson(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="outlined" onClick={addPerson}>ADD PERSON</Button>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Search Insurance Plans
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
};


export default InsuranceSearchForm;
