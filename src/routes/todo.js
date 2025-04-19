const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController.js');

router.post('/', todoController.createTodo);
router.get('/:userId', todoController.getTodosByUser);
router.get('/:userId/done', todoController.getDoneTodos);
router.get('/:userId/doing', todoController.getDoingTodos);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);
router.get('/calendar/:userId', todoController.getTodosForCalendar);

module.exports = router;
