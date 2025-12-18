const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

// GET all tasks and POST new task
router
  .route('/')
  .get(getTasks)
  .post(createTask);

// GET, PUT and DELETE single task
router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;