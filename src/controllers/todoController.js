// controllers/todoController.js

const Todo = require('../models/todo');

// Helper: format a Date object as "YYYY-MM-DD"
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Wrap a Todo document into the shape the UI needs
function toUI(todo) {
  return {
    id:        todo._id.toString(),
    title:     todo.title,
    dueDate:   formatDate(todo.dueDate),
    completed: todo.isDone
  };
}

// Create a new Todo

exports.createTodo = async (req, res) => {
  console.log('⚡️ createTodo body:', req.body);
  try {
    const todo = new Todo(req.body);
    await todo.save();
    res.status(201).json(toUI(todo));
  } catch (err) {
    console.error('❌ createTodo error:', err);
    res.status(400).json({ error: err.message });
  }
};


// Get all todos for a specific user
exports.getTodosByUser = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId });
    res.json(todos.map(toUI));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all done todos for a specific user
exports.getDoneTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId, isDone: true });
    res.json(todos.map(toUI));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all doing todos for a specific user
exports.getDoingTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId, isDone: false });
    res.json(todos.map(toUI));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a todo (e.g. mark as done or change title/dueDate)
exports.updateTodo = async (req, res) => {
  try {
    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(toUI(updated));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    const deleted = await Todo.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    // front-end ignores body, but we’ll send back the deleted id for good measure
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get todos by user and due date (for calendar)
// (UI for calendar will need title + dueDate + completed)
exports.getTodosForCalendar = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId });
    res.json(todos.map(toUI));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
