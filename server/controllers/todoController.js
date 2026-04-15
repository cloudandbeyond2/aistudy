import Todo from '../models/Todo.js';

// Get all todos for a user
export const getAllTodos = async (req, res) => {
  try {
    const { uid, role } = req.query;
    
    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    const filter = { uid };  // ✅ Using uid
    if (role && role !== 'user') filter.role = role;
    
    const todos = await Todo.find(filter).sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: todos,
      message: 'Todos fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Create new todo
export const createTodo = async (req, res) => {
  try {
    const { uid, role, title, notes, dueDate, priority } = req.body;
    
    // console.log('Creating todo with data:', { uid, role, title, notes, dueDate, priority });
    
    // Validate required fields
    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }
    
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title is required' 
      });
    }
    
    // Create todo with uid field
    const todo = new Todo({ 
      uid,        // ✅ Using uid (not userId)
      role: role || 'user',
      title: title.trim(),
      notes: notes || '',
      dueDate: dueDate || null,
      priority: priority || 'Medium'
    });
    
    // console.log('Todo object before save:', todo); 
    
    await todo.save();
    
    // console.log('Todo saved successfully:', todo); 
    
    res.status(201).json({ 
      success: true, 
      data: todo,
      message: 'Todo created successfully'
    });
  } catch (error) {
    console.error('Error creating todo:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get a single todo by ID
export const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    const todo = await Todo.findOne({ _id: id, uid });  // ✅ Using uid

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    console.error('Error fetching todo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update a todo
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid, title, notes, dueDate, priority, completed } = req.body;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    // Find todo and verify ownership
    const todo = await Todo.findOne({ _id: id, uid });  // ✅ Using uid

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    // Update fields
    if (title !== undefined) todo.title = title.trim();
    if (notes !== undefined) todo.notes = notes;
    if (dueDate !== undefined) todo.dueDate = dueDate;
    if (priority !== undefined) todo.priority = priority;
    if (completed !== undefined) todo.completed = completed;
    
    todo.updatedAt = new Date();
    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Todo updated successfully',
      data: todo
    });
  } catch (error) {
    console.error('Error updating todo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete a todo
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    const todo = await Todo.findOneAndDelete({ _id: id, uid });  // ✅ Using uid

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully',
      data: { id: todo._id }
    });
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Toggle todo completion status
export const toggleTodoCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    const todo = await Todo.findOne({ _id: id, uid });  // ✅ Using uid

    if (!todo) {
      return res.status(404).json({ 
        success: false, 
        message: 'Todo not found' 
      });
    }

    todo.completed = !todo.completed;
    todo.updatedAt = new Date();
    await todo.save();

    res.status(200).json({
      success: true,
      message: `Todo marked as ${todo.completed ? 'completed' : 'incomplete'}`,
      data: todo
    });
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete all completed todos for a user
export const deleteCompletedTodos = async (req, res) => {
  try {
    const { uid, role } = req.body;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    const filter = { uid, completed: true };  // ✅ Using uid
    if (role && role !== 'user') filter.role = role;

    const result = await Todo.deleteMany(filter);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} completed todo(s) deleted successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Error deleting completed todos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Reset all todos for a user
export const resetAllTodos = async (req, res) => {
  try {
    const { uid, role } = req.body;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    const filter = { uid };  // ✅ Using uid
    if (role && role !== 'user') filter.role = role;

    const result = await Todo.deleteMany(filter);

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} todo(s) reset successfully`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Error resetting todos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get todo statistics for a user
export const getTodoStats = async (req, res) => {
  try {
    const { uid, role } = req.query;

    if (!uid) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID (uid) is required' 
      });
    }

    const filter = { uid };  // ✅ Using uid
    if (role && role !== 'user') filter.role = role;

    const todos = await Todo.find(filter);
    
    const stats = {
      total: todos.length,
      completed: todos.filter(t => t.completed).length,
      incomplete: todos.filter(t => !t.completed).length,
      high: todos.filter(t => t.priority === 'High').length,
      medium: todos.filter(t => t.priority === 'Medium').length,
      low: todos.filter(t => t.priority === 'Low').length
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};