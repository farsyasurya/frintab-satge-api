const express = require('express');

const { createGroup, getGroups, joinGroup, getMyGroups , getGroupDetail} = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createGroup);
router.get('/', authMiddleware, getGroups);
router.post('/join', authMiddleware, joinGroup);
router.get('/me', authMiddleware, getMyGroups);
router.get('/:id', authMiddleware, getGroupDetail);
module.exports = router;
