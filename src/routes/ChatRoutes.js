const express = require('express');
const router = express.Router();
const chatController = require('../controllers/ChatController');

router.post('/', chatController.createChat);
router.get('/', chatController.getChats);
router.get('/:id', chatController.getChat);
router.put('/:id', chatController.updateChat);
router.delete('/:id', chatController.deleteChat);

module.exports = router;
