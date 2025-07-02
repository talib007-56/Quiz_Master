# 🎯 Quiz Master

A comprehensive, full-featured quiz management system built with the MERN stack. Quiz Master provides a complete solution for creating, managing, and taking quizzes with advanced analytics and user management.

![Quiz Master Banner](https://via.placeholder.com/800x200/4f46e5/ffffff?text=Quiz+Master+-+Complete+Quiz+Management+System)

## ✨ Features

### 🔐 Authentication & Authorization
- **Secure JWT-based authentication**
- **Role-based access control** (Admin/User)
- **Password encryption** with bcrypt
- **Persistent login sessions**

### 👨‍💼 Admin Features
- **Complete quiz management** (Create, Read, Update, Delete)
- **Subject and chapter organization**
- **Question bank management**
- **User management and monitoring**
- **Advanced analytics dashboard**
- **Bulk data export** (CSV, Excel)
- **Real-time notifications**

### 👨‍🎓 User Features
- **Interactive quiz taking** with timer
- **Real-time progress tracking**
- **Comprehensive score analytics**
- **Quiz review with detailed explanations**
- **Performance insights and trends**
- **Retake quizzes with new questions**
- **Mobile-responsive interface**

### 🚀 Advanced Features
- **Skeleton loading states** for better UX
- **Real-time notifications** with toast system
- **Quiz randomization** (questions and options)
- **Performance analytics** with charts
- **Search and filtering** capabilities
- **Responsive sidebar navigation**
- **Environment configuration**
- **Database indexing** for performance

## 🛠️ Tech Stack

### Frontend
- **React.js 18** with Hooks
- **React Router** for navigation
- **Bootstrap 5** for styling
- **Chart.js** for analytics
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **Redis** for caching
- **BullMQ** for job processing
- **Nodemailer** for emails

### Development Tools
- **ESLint** for code quality
- **Environment configuration**
- **Performance optimizations**
- **Custom hooks and utilities**

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **Redis** (optional, for caching)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/quiz-master.git
cd quiz-master
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start the frontend development server
npm run dev
```

### 4. Database Setup
```bash
# Make sure MongoDB is running
mongod

# The application will automatically create the database
# and collections on first run
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/quiz-master

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=24h

# Server
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Notifications (Optional)
GOOGLE_CHAT_WEBHOOK=your_google_chat_webhook_url
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5001/api

# Application Settings
VITE_APP_NAME=Quiz Master
VITE_APP_VERSION=1.0.0

# Quiz Settings
VITE_MAX_QUIZ_TIME=3600
VITE_PAGINATION_SIZE=10
VITE_ENABLE_ANALYTICS=true
```

## 📁 Project Structure

```
quiz-master/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middleware
│   │   ├── jobs/           # Background jobs
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/
│   ├── .env.example
│   └── package.json
└── README.md
```

## 🎮 Usage Guide

### For Administrators
1. **Login** with admin credentials
2. **Create subjects** and chapters
3. **Add quizzes** with questions
4. **Manage users** and monitor performance
5. **View analytics** and export data

### For Users
1. **Register** and login
2. **Browse available quizzes**
3. **Take quizzes** with real-time timer
4. **View scores** and detailed analytics
5. **Review answers** and track progress

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Quizzes
- `GET /api/quizzes` - Get all quizzes (with pagination)
- `POST /api/quizzes` - Create new quiz (admin)
- `PUT /api/quizzes/:id` - Update quiz (admin)
- `DELETE /api/quizzes/:id` - Delete quiz (admin)

### Scores
- `GET /api/scores` - Get user scores
- `POST /api/scores` - Submit quiz answers
- `GET /api/scores/:id` - Get specific score details

## 🎨 Features Showcase

### Dashboard Analytics
- **Performance trends** with interactive charts
- **Subject-wise analysis**
- **Time-based statistics**
- **Comprehensive reporting**

### Quiz Experience
- **Randomized questions** and options
- **Real-time timer** with warnings
- **Auto-save functionality**
- **Detailed review system**

### Admin Management
- **Bulk operations** for efficiency
- **Advanced filtering** and search
- **User activity monitoring**
- **Content management tools**

## 🚀 Performance Optimizations

- **Database indexing** for faster queries
- **Pagination** for large datasets
- **Skeleton loaders** for better UX
- **Debounced search** to reduce API calls
- **Memoized components** to prevent re-renders
- **Environment-based configuration**

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. **Build frontend**
```bash
cd frontend
npm run build
```

2. **Deploy backend**
```bash
cd backend
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **MongoDB** for the flexible database
- **Bootstrap** for the UI components
- **Chart.js** for beautiful charts

## 📞 Default Credentials

### Admin Access
```
Email: admin@quizmaster.com
Password: admin123
```

---

<div align="center">
  <p>Made with ❤️ by the Quiz Master Team</p>
  <p>
    <a href="#quiz-master">Back to Top</a> •
    <a href="./FEATURES_README.md">Features</a>
  </p>
</div> 