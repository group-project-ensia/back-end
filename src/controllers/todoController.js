const Todo = require('../models/todo');

// Helper function to get tomorrow’s date in DD/MM/YYYY format
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day = String(tomorrow.getDate()).padStart(2, '0');
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = tomorrow.getFullYear();
  return `${day}/${month}/${year}`;
}

// Create a new Todo
exports.createTodo = async (req, res) => {
  try {
    const data = req.body;

    // If dueTime is not provided, set it to tomorrow
    if (!data.dueTime) {
      data.dueTime = getTomorrowDate();
    }

    const todo = new Todo(data);
    await todo.save();
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get all todos for a specific user
exports.getTodosByUser = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all done todos for a specific user
exports.getDoneTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId, isDone: true });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all doing todos for a specific user
exports.getDoingTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.params.userId, isDone: false });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a todo (e.g. mark as done)
exports.updateTodo = async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    res.json(updatedTodo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get todos by user and due date (for calendar)
exports.getTodosForCalendar = async (req, res) => {
    try {
      const { userId } = req.params;
      // Get all todos of a user and populate the dueDate field
      const todos = await Todo.find({ userId: userId });
      
      // Format the todos to send only the necessary data
      const formattedTodos = todos.map(todo => ({
        title: todo.title,
        description: todo.description,
        dueDate: todo.dueDate,
        isDone: todo.isDone,
      }));
      
      res.json(formattedTodos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };