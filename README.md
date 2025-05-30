# Quiz Master - MERN Stack

A multi-user quiz application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- Admin dashboard for managing quizzes, subjects, chapters, and users
- User authentication and role-based access control
- Quiz taking with timer
- Score tracking and performance analytics
- Daily reminders and monthly reports via email
- Redis caching for improved performance
- BullMQ for background job processing
- CSV export functionality

## Technology Stack

### Backend
- MongoDB (Database)
- Express.js (API Framework)
- Node.js (Runtime)
- JWT Authentication
- Redis (Caching)
- BullMQ (Job Queue)
- Node-cron (Scheduling)
- Nodemailer (Email Service)

### Frontend
- React.js with Vite
- React Router
- Bootstrap CSS
- Chart.js for analytics

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- MongoDB
- Redis

### Installation

1. Clone the repository
```
git clone <repository-url>
cd quiz-master
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Configure environment variables
```
# Create a .env file in the backend directory with the following variables
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quiz-master
JWT_SECRET=your_jwt_secret_key
REDIS_URL=redis://localhost:6379
NODE_ENV=development
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
GOOGLE_CHAT_WEBHOOK=your_google_chat_webhook_url
```

4. Install frontend dependencies
```
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server
```
cd backend
npm run dev
```

2. Start the frontend development server
```
cd frontend
npm run dev
```

3. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
quiz-master/
├── backend/             # Express.js backend
│   ├── src/             # Source code
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── jobs/        # Cron jobs and background tasks
│   │   ├── middlewares/ # Express middlewares
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Server entry point
│   └── package.json     # Backend dependencies
│
├── frontend/            # React frontend
│   ├── public/          # Static files
│   ├── src/             # Source code
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service functions
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main App component
│   │   └── main.jsx     # Entry point
│   └── package.json     # Frontend dependencies
│
├── jobs/                # Background job handlers
├── reports/             # Generated reports
└── README.md            # Project documentation
```

## Default Admin Credentials

```
Email: admin@quizmaster.com
Password: admin123
```

## License

This project is licensed under the ISC License. 