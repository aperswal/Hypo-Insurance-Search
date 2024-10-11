const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

console.log('Marketplace CMS API Key:', process.env.MARKETPLACE_CMS_API_KEY ? 'Set' : 'Not Set');
console.log('Google API Key:', process.env.REACT_APP_GOOGLE_API_KEY ? 'Set' : 'Not Set');
console.log('Back4App App ID:', process.env.BACK4APP_APP_ID_KEY ? 'Set' : 'Not Set');
console.log('Back4App API Key:', process.env.BACK4APP_API_KEY ? 'Set' : 'Not Set');
console.log('API Gateway URL:', process.env.REACT_APP_API_GATEWAY_URL);

const app = express();
const port = process.env.PORT || 3001;
const API_BASE_URL = process.env.REACT_APP_API_GATEWAY_URL;

app.use(cors());
app.use(express.json());

// Handle GET requests for name-based search
app.get('/api/hospitals', async (req, res) => {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_GATEWAY_URL is not set in environment variables');
    }
    console.log(`Fetching from: ${API_BASE_URL}/hospitals?query=${req.query.query}`);
    const response = await axios.get(`${API_BASE_URL}/hospitals`, {
      params: req.query
    });
    console.log('API Gateway response status:', response.status);
    console.log('API Gateway response data:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying hospital name search:', error);
    console.error('Error response:', error.response?.data);
    res.status(500).json({ 
      error: 'An error occurred while searching hospitals by name', 
      details: error.message,
      response: error.response?.data
    });
  }
});

// Handle POST requests for radius-based search
app.post('/api/hospitals', async (req, res) => {
  try {
    if (!API_BASE_URL) {
      throw new Error('API_GATEWAY_URL is not set in environment variables');
    }
    console.log(`Posting to: ${API_BASE_URL}/hospitals`);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const response = await axios.post(`${API_BASE_URL}/hospitals`, req.body);
    console.log('API Gateway response status:', response.status);
    console.log('API Gateway response data:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying hospital radius search:', error.message);
    res.status(500).json({ 
      error: 'An error occurred while searching hospitals by radius', 
      details: error.message,
      response: error.response?.data
    });
  }
});

app.get('/api/counties/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const response = await axios.get(
      'https://parseapi.back4app.com/classes/Uscounties_Area',
      {
        params: {
          where: JSON.stringify({ stateAbbreviation: state }),
          limit: 1000,
        },
        headers: {
          'X-Parse-Application-Id': process.env.BACK4APP_APP_ID_KEY,
          'X-Parse-REST-API-Key': process.env.BACK4APP_API_KEY,
        }
      }
    );
    
    console.log('Back4App API Response:', JSON.stringify(response.data, null, 2));

    if (!response.data || !response.data.results) {
      throw new Error('Unexpected response format from Back4App API');
    }

    const counties = response.data.results.map(item => item.countyName);
    console.log('Processed counties:', counties);

    res.json(counties);
  } catch (error) {
    console.error('Error fetching counties:', error);
    res.status(500).json({ error: 'Failed to fetch counties', details: error.message });
  }
});

app.post('/api/insurance-plans', async (req, res) => {
  try {
    const { income, zipCode, county, state, people, market, year } = req.body;
    
    console.log('Received request:', { income, zipCode, county, state, market, year });

    // Fetch county FIPS code from Back4App
    const back4appResponse = await axios.get(
      'https://parseapi.back4app.com/classes/Uscounties_Area',
      {
        params: {
          where: JSON.stringify({ stateAbbreviation: state, countyName: county }),
          limit: 1,
        },
        headers: {
          'X-Parse-Application-Id': process.env.BACK4APP_APP_ID_KEY,
          'X-Parse-REST-API-Key': process.env.BACK4APP_API_KEY,
        }
      }
    );

    console.log('Back4App API Response:', JSON.stringify(back4appResponse.data, null, 2));

    if (!back4appResponse.data.results || back4appResponse.data.results.length === 0) {
      throw new Error('County not found in Back4App data');
    }

    const countyData = back4appResponse.data.results[0];
    const fullFips = countyData.FIPSCode + countyData.countyCode;

    console.log('Full FIPS code:', fullFips);

    const apiUrl = 'https://marketplace.api.healthcare.gov/api/v1/plans/search';
    const apiKey = process.env.MARKETPLACE_CMS_API_KEY;

    console.log('Using API Key:', apiKey ? 'API key is set' : 'API key is not set');

    const requestBody = {
      household: {
        income: parseInt(income),
        people: people.map(person => ({
          age: parseInt(person.age),
          aptc_eligible: person.eligibleForCoverage,
          gender: person.gender,
          uses_tobacco: person.tobaccoUser
        }))
      },
      market: market,
      place: {
        countyfips: fullFips,
        state: state,
        zipcode: zipCode
      },
      year: parseInt(year)
    };

    console.log('Marketplace API Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${apiUrl}?apikey=${apiKey}`, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Marketplace API Response Status:', response.status);
    console.log('Marketplace API Response Data:', JSON.stringify(response.data, null, 2));

    if (!response.data || !Array.isArray(response.data.plans)) {
      throw new Error('Invalid response format from Marketplace API');
    }

    res.json({ plans: response.data.plans });
  } catch (error) {
    console.error('Error fetching insurance plans:', error.message);
    console.error('Full error object:', error);
    
    let errorResponse = {
      error: 'An error occurred while fetching insurance plans',
      details: error.message,
      apiKey: process.env.MARKETPLACE_CMS_API_KEY ? 'API key is set' : 'API key is not set'
    };

    if (error.response) {
      errorResponse.statusCode = error.response.status;
      errorResponse.apiResponse = error.response.data;
    }

    res.status(500).json(errorResponse);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});