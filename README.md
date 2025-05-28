# Aspire EMV Calculator

![Aspire Logo](/client/public/icon.png)

## Overview

The Aspire EMV Calculator is an internal admin tool for an influencer marketing platform, primarily used by an agency team helping brands calculate the monetary impact of organic social media engagement. This application provides a comprehensive framework for estimating Earned Media Value (EMV) based on a variety of metrics and influencer characteristics.

## Key Features

- **Individual EMV Calculation**: Calculate EMV for individual social media posts with customizable parameters
- **Bulk EMV Calculation**: Upload CSV files to process multiple EMV calculations at once
- **Reference Guide**: Detailed breakdown of the EMV methodology and calculation factors
- **Customizable Settings**: Modify base values, creator factors, and platform-specific metrics
- **Historical Data**: View and export previous EMV calculations
- **Change Log**: Track modifications to calculation parameters and methodology

## Creator Size Categories

The application uses the following influencer size categories:

- Brand Fan (<2.5k followers)
- Nano (2.5k-25k followers)
- Micro (25k-60k followers)
- Mid-Tier (60k-100k followers)
- Macro (100k-1M followers)

## Content Topics

The default content topics with their associated factors include:

- Beauty (1.3)
- Fashion (1.2)
- Fitness (1.1)
- Finance (0.8)
- Food (1.2)
- Game (0.9)
- Music (1.1)
- Travel (1.1)
- Technology (0.9)
- Other (1.0)

## Technical Stack

- **Frontend**: React with TypeScript, Shadcn UI components, TailwindCSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: React Query
- **Form Handling**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- Docker (with Docker Compose)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-organization/aspire-emv-calculator.git
   cd aspire-emv-calculator
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/emv_calculator
   ```

4. Start the local database using Docker:

   ```
   npm run db:start
   ```

5. Set up the database:

   ```
   npm run db:push
   ```

6. Start the development server:

   ```
   npm run dev
   ```

7. Access the application at `http://localhost:5000`

## Deployment

The application can be deployed to any platform that supports Node.js applications. Make sure to set up the necessary environment variables for the production environment.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

This project is licensed under the [MIT License](LICENSE).

---

© 2025 Aspire Influencer Marketing Platform
