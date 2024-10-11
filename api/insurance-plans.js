// api/insurance-plans.js
const axios = require('axios');

module.exports = async (req, res) => {
  const { BACK4APP_APP_ID_KEY, BACK4APP_API_KEY, MARKETPLACE_CMS_API_KEY } = process.env;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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
          'X-Parse-Application-Id': BACK4APP_APP_ID_KEY,
          'X-Parse-REST-API-Key': BACK4APP_API_KEY,
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
    const apiKey = MARKETPLACE_CMS_API_KEY;

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

    res.status(200).json({ plans: response.data.plans });
  } catch (error) {
    console.error('Error fetching insurance plans:', error.message);
    console.error('Full error object:', error);
    
    let errorResponse = {
      error: 'An error occurred while fetching insurance plans',
      details: error.message,
      apiKey: MARKETPLACE_CMS_API_KEY ? 'API key is set' : 'API key is not set'
    };

    if (error.response) {
      errorResponse.statusCode = error.response.status;
      errorResponse.apiResponse = error.response.data;
    }

    res.status(500).json(errorResponse);
  }
};
