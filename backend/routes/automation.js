const express = require('express');
const router = express.Router();
const automationController = require('../controllers/automationController');
const { authMiddleware } = require('../middleware/auth');
const { planBasedLimiter } = require('../middleware/rateLimiter');
const validators = require('../utils/validator');

// All routes require authentication
router.use(authMiddleware);

// Automation CRUD
router.post('/', planBasedLimiter, validators.createAutomation, validators.checkResult, automationController.createAutomation);
router.get('/', automationController.getAutomations);
router.get('/:id', validators.isValidObjectId, automationController.getAutomationById);
router.put('/:id', validators.updateAutomation, validators.checkResult, automationController.updateAutomation);
router.delete('/:id', automationController.deleteAutomation);

// Automation control
router.post('/:id/start', automationController.startAutomation);
router.post('/:id/pause', automationController.pauseAutomation);

module.exports = router;
