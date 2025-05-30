const { createAdmin } = require('../controllers/auth.controller');

// Initialize necessary data on server startup
const initializeData = async () => {
  try {
    // Create default admin user if none exists
    await createAdmin();
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

module.exports = { initializeData }; 