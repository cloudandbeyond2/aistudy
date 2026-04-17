import express from 'express';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
  deleteCompletedTodos,
  resetAllTodos,
  getTodoStats
} from '../controllers/todoController.js';

const router = express.Router();

// Stats route (must be before /:id routes)
router.get('/stats', getTodoStats);

// Get all todos
router.get('/', getAllTodos);

// Get single todo by ID
router.get('/:id', getTodoById);

// Create new todo
router.post('/', createTodo);

// Update todo
router.put('/:id', updateTodo);

// Toggle todo completion
router.patch('/:id/toggle', toggleTodoCompletion);

// Delete todo
router.delete('/:id', deleteTodo);

// Delete all completed todos
router.delete('/completed/clear', deleteCompletedTodos);

// Reset all todos
router.delete('/reset/all', resetAllTodos);

export default router;
