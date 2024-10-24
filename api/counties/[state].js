const axios = require('axios');

module.exports = async (req, res) => {
  const { BACK4APP_APP_ID_KEY, BACK4APP_API_KEY } = process.env;
  const { state } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const fetchCounties = async (retryCount = 0) => {
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
          },
          timeout: 30000 // Increase timeout to 15 seconds
        }
      );

      if (!response.data || !response.data.results) {
        throw new Error('Unexpected response format from Back4App API');
      }

      return response.data.results.map(item => item.countyName);
    } catch (error) {
      if (retryCount < 2) { // Retry up to 2 times
        console.warn(`Retrying fetchCounties... Attempt ${retryCount + 1}`);
        return fetchCounties(retryCount + 1);
      }
      throw error;
    }
  };

  try {
    const counties = await fetchCounties();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(counties);
  } catch (error) {
    console.error('Error fetching counties:', error);

    let errorMessage = 'Failed to fetch counties';
    let statusCode = 500;

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out while fetching counties';
      statusCode = 504;
    } else if (error.response) {
      errorMessage = `Back4App API error: ${error.response.status}`;
      statusCode = error.response.status;
    }

    res.status(statusCode).json({ 
      error: errorMessage, 
      details: error.message,
      code: error.code
    });
  }
};