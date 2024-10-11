# Healthcare Insurance Plan Finder

## Overview

The Healthcare Insurance Plan Finder is a comprehensive web application that allows users to search for and compare health insurance plans in the United States. It leverages the HealthCare.gov Marketplace API to provide up-to-date information on available insurance plans based on user-specific criteria.

## Features

### Insurance Plan Search
- Search for health insurance plans based on:
  - Household income
  - ZIP code
  - State and county
  - Household members' information (age, gender, eligibility factors)
- Display matching insurance plans with detailed information
- Filter plans based on metal level, plan type, issuer, premium range, deductible range, HSA eligibility, and national network coverage
- Sort plans by various criteria (premium, deductible, rating)

### User-Friendly Interface
- Responsive design for various screen sizes
- Interactive form for inputting search criteria
- Expandable cards for detailed plan information
- Advanced filtering and sorting options

### Data Integration
- Real-time data from the HealthCare.gov Marketplace API
- County information from Back4App API
- Comprehensive error handling and user feedback

## Technologies Used

- Frontend:
  - React.js
  - Material-UI (MUI) for styling and components
- Backend:
  - Node.js
  - Express.js
- APIs:
  - HealthCare.gov Marketplace API
  - Back4App API for county data
- Deployment:
  - Vercel for serverless functions and hosting

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/healthcare-insurance-plan-finder.git
   cd healthcare-insurance-plan-finder
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```
   MARKETPLACE_CMS_API_KEY=your_marketplace_api_key_here
   BACK4APP_APP_ID_KEY=your_back4app_app_id_here
   BACK4APP_API_KEY=your_back4app_api_key_here
   ```

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Fill out the insurance search form with your household information:
   - Income
   - ZIP code
   - State and county
   - Details for each household member
2. Click "Search Insurance Plans" to view matching plans
3. Use the filter options to refine your search results
4. Sort plans based on your preferences
5. Click on a plan card to expand and view additional information

## API Integration

### Marketplace API

This application uses the HealthCare.gov Marketplace API to search for insurance plans. The main endpoint used is:

POST /api/v1/plans/search

For detailed API documentation, visit the [Marketplace API Documentation](https://marketplace.api.healthcare.gov/api-docs/).

### Back4App API

The application uses Back4App to fetch county data for the United States. This data is used in conjunction with the Marketplace API to provide accurate location-based insurance plan searches.

## Contributing

Contributions to improve the Healthcare Insurance Plan Finder are welcome. Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- HealthCare.gov Marketplace API for insurance plan data
- Back4App for providing county data
- Material-UI for React components and styling
