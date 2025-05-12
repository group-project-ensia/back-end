const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController.js');

router.post('/', todoController.createTodo);

// specific collection routes first
router.get('/calendar/:userId', todoController.getTodosForCalendar);
router.get('/:userId/done',     todoController.getDoneTodos);
router.get('/:userId/doing',    todoController.getDoingTodos);
// then the catch-all for fetching all todos:
router.get('/:userId',          todoController.getTodosByUser);

router.put('/:id',    todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

module.exports = router;
