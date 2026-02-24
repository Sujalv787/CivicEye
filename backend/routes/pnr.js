const express = require('express');
const router = express.Router();
const { verifyPNR } = require('../controllers/pnrController');
const { protect } = require('../middleware/auth');

// POST /api/pnr/verify — citizen must be logged in
router.post('/verify', protect, verifyPNR);

module.exports = router;
