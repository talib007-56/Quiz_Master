const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/explain', verifyToken, aiController.explainAnswer);
router.post('/generate-questions', verifyToken, aiController.generateQuestions);

module.exports = router;
