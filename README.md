# Healthcare Insurance Plan Finder

## Overview

The Healthcare Insurance Plan Finder is a comprehensive web application that allows users to search for and compare health insurance plans in the United States. It leverages the HealthCare.gov Marketplace API to provide up-to-date information on available insurance plans based on user-specific criteria. The application now includes a personalized consultation feature with Stripe integration for payment processing.

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

### Personalized Consultation
- Interactive questionnaire to gather detailed information about the user's healthcare needs
- Stripe integration for secure payment processing
- Personalized insurance plan recommendations based on user inputs

### User-Friendly Interface
- Responsive design for various screen sizes
- Interactive form for inputting search criteria
- Expandable cards for detailed plan information
- Advanced filtering and sorting options

### Data Integration
- Real-time data from the HealthCare.gov Marketplace API
- County information from Back4App API
- Comprehensive error handling and user feedback
- Secure storage of consultation data in MongoDB

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
  - Stripe API for payment processing
- Database:
  - MongoDB for storing consultation data
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
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
   MONGODB_URI=your_mongodb_connection_string_here
   ```

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000` to use the application.

## Usage

1. Start the personalized consultation by clicking on the consultation button.
2. Answer the questionnaire to provide detailed information about your healthcare needs.
3. Complete the payment process using Stripe.
4. Receive personalized insurance plan recommendations based on your inputs.
5. Use the filter options to refine your search results.
6. Sort plans based on your preferences.
7. Click on a plan card to expand and view additional information.

## Project Structure

├── .vercel/                # Vercel deployment configuration
├── api/                     # API endpoints and backend logic
│   └── counties/           # County-related API endpoints
│       ├── [state].js      # State-specific county data
│       ├── create-checkout-session.js
│       ├── insurance-plans.js
│       └── webhook-stripe.js
├── build/                   # Build output directory
├── node_modules/            # Node.js dependencies
├── public/                  # Static public assets
├── src/                     # Source code
│   ├── components/         # React components
│   │   ├── ConsultationPopup.js
│   │   ├── ConsultationQuestions.js
│   │   ├── InsuranceCard.js
│   │   ├── InsuranceConsultationBox.js
│   │   ├── InsuranceFilterComponent.js
│   │   ├── InsurancePlanList.js
│   │   ├── InsuranceSearchForm.js
│   │   └── InsuranceSortComponent.js
│   ├── pages/             # Page components
│   │   ├── Cancel.js      # Cancel page
│   │   └── Success.js     # Success page
│   ├── utils/             # Utility functions
│   │   └── dynamodb.js    # DynamoDB utilities
│   ├── App.css            # Main application styles
│   ├── App.js             # Main application component
│   ├── index.css          # Global styles
│   └── index.js           # Application entry point
├── .env                    # Environment variables
├── .env.local             # Local environment variables
├── .gitignore             # Git ignore configurations
├── LICENSE                # Project license
├── package-lock.json      # Dependency lock file
├── package.json           # Project configuration and dependencies
└── output.txt             # Output logs

## API Integration

### Marketplace API

This application uses the HealthCare.gov Marketplace API to search for insurance plans. The main endpoint used is:

POST /api/v1/plans/search

For detailed API documentation, visit the [Marketplace API Documentation](https://marketplace.api.healthcare.gov/api-docs/).

### Back4App API

The application uses Back4App to fetch county data for the United States. This data is used in conjunction with the Marketplace API to provide accurate location-based insurance plan searches.

### Stripe API

Stripe is used for secure payment processing during the consultation process. The application integrates with Stripe's Checkout API and uses webhooks to handle successful payments.

## Contributing

Contributions to improve the Healthcare Insurance Plan Finder are welcome. Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

- HealthCare.gov Marketplace API for insurance plan data.
- Back4App for providing county data.
- Stripe for secure payment processing.
- Material-UI for React components and styling.
- MongoDB for data storage.