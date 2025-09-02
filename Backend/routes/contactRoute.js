const express = require('express');
const router = express.Router();
const {submitContactForm} = require('../controllers/contactController');
const isAdmin = require('../middleware/isAdmin');
const auth = require('../middleware/auth');
router.post('/', submitContactForm);

module.exports = router;