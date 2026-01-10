# Shakey's Pizza - Reservation System

A comprehensive food reservation website built with React, Vite, and modern web technologies.

## Features

### Customer Features
- **Account Management**: Register, login, and logout with customer or admin roles
- **Menu Browsing**: View all available food items organized by category
- **Reservation System**: 
  - Calendar-like interface for easy date selection
  - View all existing reservations (anonymized)
  - Create, modify, and cancel reservations
  - Pre-order food items
  - Add special notes (birthdays, dietary restrictions, etc.)
  - Email notifications for all actions (simulated)
- **Feedback System**: Submit ratings, comments, and answer surveys
- **AI Chatbot**: Interactive chatbot for customer support and inquiries

### Admin Features
- **Admin Dashboard**: Comprehensive overview with key metrics
- **Reservation Management**: 
  - View all reservations with customer details
  - Update reservation status (pending, confirmed, fulfilled, no-show)
  - Manual override for no-shows
- **Analytics & Insights**:
  - AI-powered demand forecasting
  - Peak hours prediction
  - Most ordered items analysis
  - Customer sentiment analysis from feedbacks
  - Visual charts and graphs (weekly, monthly, yearly filters)
- **Menu Management**: Create, update, and delete menu items
- **Availability Control**:
  - Set max tables and customers for specific dates/times
  - Block entire time slots for events
  - Block specific tables for walk-ins
- **Feedback Analysis**: View and analyze customer feedbacks with sentiment scoring

## Technology Stack

- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **Database**: SQL.js (in-memory/localStorage-persisted SQL database)
- **Styling**: TailwindCSS with custom pizza-themed colors
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Components**:
  - Custom lightweight chatbot
  - Analytics module for predictions and sentiment analysis
- **Date Handling**: date-fns

## Installation

1. Navigate to the project directory:
```bash
cd shakeys-pizza
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

## Default Credentials

**Admin Account:**
- Email: `admin@shakeys.com`
- Password: `admin123`
- Security Question: "What is your favorite pizza?"
- Security Answer: "pepperoni"

## Project Structure

```
shakeys-pizza/
├── src/
│   ├── ai/
│   │   ├── analytics.js      # AI analytics module
│   │   └── chatbot.js         # Lightweight chatbot
│   ├── api/
│   │   └── api.js             # Local API layer
│   ├── components/
│   │   ├── Chatbot.jsx        # Chatbot UI component
│   │   ├── Footer.jsx         # Footer with contact info
│   │   └── Navbar.jsx         # Navigation bar
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── database/
│   │   └── db.js              # SQL.js database setup
│   ├── pages/
│   │   ├── AdminDashboard.jsx # Admin dashboard
│   │   ├── Feedback.jsx       # Feedback page
│   │   ├── Home.jsx           # Home page
│   │   ├── Login.jsx          # Login page
│   │   ├── Menu.jsx           # Menu page
│   │   ├── Register.jsx       # Registration page
│   │   └── Reservation.jsx    # Reservation page
│   ├── App.jsx                # Main app component
│   ├── index.css              # Global styles
│   └── main.jsx               # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Database Schema

### Tables
- **users**: User accounts (customer/admin)
- **food_items**: Menu items
- **reservations**: Customer reservations
- **customer_feedbacks**: Customer feedback and ratings
- **availability**: Time slot availability settings
- **table_blocks**: Specific table blocking for walk-ins

## Color Scheme

The application uses a pizza-themed color palette:
- **Primary Red**: #DC2626 (pizza-red)
- **Dark Red**: #991B1B (pizza-darkred)
- **Yellow**: #FCD34D (pizza-yellow)
- **Gold**: #F59E0B (pizza-gold)
- **Black**: #0F0F0F (pizza-black)
- **Cream**: #FEF3C7 (pizza-cream)
- **Brown**: #78350F (pizza-brown)

## Key Features Implementation

### 1. SQL.js Database
- No setup required, runs entirely in the browser
- Data persisted to localStorage
- Pre-populated with sample menu items and admin account

### 2. Local API Layer
- All CRUD operations handled locally
- No server required
- Simulated email notifications

### 3. AI Chatbot
- Pattern-matching based responses
- Handles common queries about menu, hours, reservations, etc.
- Lightweight and fast

### 4. Analytics Module
- Peak hours analysis
- Demand forecasting
- Sentiment analysis using keyword matching
- Popular items tracking
- Predictive insights generation

### 5. Admin Security
- Additional security question required for admin registration
- Role-based access control
- Protected routes

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Notes

- Email notifications are simulated (messages shown in console)
- Database resets on browser cache clear (use export/import for persistence)
- All data is stored locally in the browser
- No external API calls or server required

## Future Enhancements

- Email integration for real notifications
- Payment processing
- Online ordering
- Delivery tracking
- Mobile app version
- Advanced AI with natural language processing
- Real-time availability updates
- Multi-language support

## License

This project is created for demonstration purposes.

## Contact

For questions or support, visit the restaurant at:
- **Address**: 123 Pizza Street, Food City, FC 12345
- **Phone**: (555) 123-4567
- **Email**: info@shakeyspizza.com
