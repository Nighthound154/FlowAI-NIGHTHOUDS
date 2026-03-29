const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { generate, getProjects, getProject, deleteProject } = require('../controllers/flowai');

const router = express.Router();

// Strict rate limit for AI generation (expensive calls)
const generateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many requests. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/generate',
  auth,
  generateLimit,
  [body('idea').trim().isLength({ min: 10, max: 2000 }).withMessage('Idea must be 10-2000 characters')],
  generate
);

router.get('/projects', auth, getProjects);
router.get('/projects/:id', auth, getProject);
router.delete('/projects/:id', auth, deleteProject);

module.exports = router;
