const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController')
const isAdmin = require('../middleware/isAdmin')
const auth = require('../middleware/auth')
const {getAllUsers} = require('../controllers/adminController')
// View all users, block/unblock, approve/reject organizer

router.get('/users', auth,isAdmin, getAllUsers);
router.patch('/users/:id/block', auth,isAdmin, adminController.blockUser);
router.patch('/users/:id/unblock', auth,isAdmin, adminController.unblockUser);
router.patch('/users/:id/approve-organizer', auth,isAdmin, adminController.approveOrganizer);
router.patch('/users/:id/reject-organizer', auth,isAdmin, adminController.rejectOrganizer);

router.get('/dashboard/stats', auth,isAdmin, adminController.getDashboardStats);
// View all events
router.get('/events', auth,isAdmin, adminController.getAllEvents);
module.exports = router;