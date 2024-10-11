// api/counties/[state].js
const axios = require('axios');

module.exports = async (req, res) => {
  const { BACK4APP_APP_ID_KEY, BACK4APP_API_KEY } = process.env;
  const { state } = req.query; // Vercel passes dynamic route params in req.query

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const response = await axios.get(
      'https://parseapi.back4app.com/classes/Uscounties_Area',
      {
        params: {
          where: JSON.stringify({ stateAbbreviation: state }),
          limit: 1000,
        },
        headers: {
          'X-Parse-Application-Id': BACK4APP_APP_ID_KEY,
          'X-Parse-REST-API-Key': BACK4APP_API_KEY,
        }
      }
    );

    console.log('Back4App API Response:', JSON.stringify(response.data, null, 2));

    if (!response.data || !response.data.results) {
      throw new Error('Unexpected response format from Back4App API');
    }

    const counties = response.data.results.map(item => item.countyName);
    console.log('Processed counties:', counties);

    res.status(200).json(counties);
  } catch (error) {
    console.error('Error fetching counties:', error);
    res.status(500).json({ error: 'Failed to fetch counties', details: error.message });
  }
};
