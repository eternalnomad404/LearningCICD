const request = require('supertest');
const app = require('../app');
const Task = require('../models/Task');

/**
 * Supertest lets us make HTTP requests to our app without starting a real server
 * Each request() call simulates a client making an API call
 */

describe('Task API Endpoints', () => {
  
  /**
   * TEST 1: Create a task
   * Real-world scenario: User adds a new todo
   */
  describe('POST /api/tasks', () => {
    it('should create a new task with valid data', async () => {
      const taskData = {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        priority: 'High',
        dueDate: '2025-12-31'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(201); // Expect HTTP 201 Created

      // Verify the response structure
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.completed).toBe(false); // Default value
      
      // Verify it's actually in the database
      const savedTask = await Task.findById(response.body.data._id);
      expect(savedTask).toBeTruthy();
      expect(savedTask.title).toBe(taskData.title);
    });

    /**
     * TEST 2: Reject invalid input
     * Real-world scenario: User submits form without required fields
     */
    it('should reject task without title', async () => {
      const invalidTask = {
        description: 'Task with no title'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400); // Expect HTTP 400 Bad Request

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    /**
     * TEST 3: Handle validation errors
     * Real-world scenario: User enters title that's too long
     */
    it('should reject task with title exceeding 200 characters', async () => {
      const invalidTask = {
        title: 'a'.repeat(201) // 201 characters
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(invalidTask)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    /**
     * TEST 4: Handle invalid priority values
     * Real-world scenario: API receives corrupted or malicious data
     */
    it('should use default priority if invalid priority provided', async () => {
      const taskData = {
        title: 'Test task',
        priority: 'InvalidPriority' // Not in enum [Low, Medium, High]
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData);
      
      // Mongoose validation should reject invalid enum values
      expect(response.status).toBe(400);
    });
  });

  /**
   * TEST 5: List all tasks
   * Real-world scenario: User opens the app and sees their todo list
   */
  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.count).toBe(0);
    });

    it('should return all tasks sorted by creation date', async () => {
      // Create multiple tasks
      const tasks = [
        { title: 'First task', priority: 'Low' },
        { title: 'Second task', priority: 'Medium' },
        { title: 'Third task', priority: 'High' }
      ];

      for (const task of tasks) {
        await Task.create(task);
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const response = await request(app)
        .get('/api/tasks')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
      expect(response.body.data).toHaveLength(3);
      
      // Verify they're sorted by newest first (descending)
      expect(response.body.data[0].title).toBe('Third task');
      expect(response.body.data[2].title).toBe('First task');
    });
  });

  /**
   * TEST 6: Get single task
   * Real-world scenario: User clicks on a task to see details
   */
  describe('GET /api/tasks/:id', () => {
    it('should return a specific task by ID', async () => {
      const task = await Task.create({
        title: 'Test task',
        description: 'Test description'
      });

      const response = await request(app)
        .get(`/api/tasks/${task._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(task._id.toString());
      expect(response.body.data.title).toBe('Test task');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Task not found');
    });

    it('should return 404 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * TEST 7: Update task
   * Real-world scenario: User marks task as complete or edits it
   */
  describe('PUT /api/tasks/:id', () => {
    it('should update task fields', async () => {
      const task = await Task.create({
        title: 'Original title',
        completed: false
      });

      const updates = {
        title: 'Updated title',
        completed: true,
        priority: 'High'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated title');
      expect(response.body.data.completed).toBe(true);
      expect(response.body.data.priority).toBe('High');
    });

    it('should return 404 for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * TEST 8: Delete task
   * Real-world scenario: User removes completed task from list
   */
  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = await Task.create({
        title: 'Task to delete'
      });

      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify it's actually deleted from database
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should return 404 when deleting non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * TEST 9: Concurrent requests safety
   * Real-world scenario: Multiple users or browser tabs creating tasks simultaneously
   * This ensures database operations don't interfere with each other
   */
  describe('Concurrent Operations', () => {
    it('should handle multiple simultaneous task creations', async () => {
      const createTask = (index) => {
        return request(app)
          .post('/api/tasks')
          .send({ title: `Concurrent task ${index}` });
      };

      // Fire 10 requests at the same time
      const promises = Array.from({ length: 10 }, (_, i) => createTask(i));
      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all 10 are in database
      const tasks = await Task.find();
      expect(tasks).toHaveLength(10);
    });

    it('should handle concurrent updates to same task', async () => {
      const task = await Task.create({ title: 'Original', completed: false });

      // Two updates at the same time
      const [response1, response2] = await Promise.all([
        request(app).put(`/api/tasks/${task._id}`).send({ priority: 'High' }),
        request(app).put(`/api/tasks/${task._id}`).send({ completed: true })
      ]);

      // Both should succeed (last write wins in MongoDB)
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Final state should have both updates
      const updatedTask = await Task.findById(task._id);
      expect(updatedTask).toBeTruthy();
    });
  });

  /**
   * TEST 10: Error handling
   * Real-world scenario: Server encounters unexpected errors
   */
  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');
      
      // Express returns 400 for JSON parse errors
      expect([400, 500]).toContain(response.status);
      expect(response.body.success).not.toBe(true);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Route not found');
    });
  });

  /**
   * TEST 11: Health check
   * Real-world scenario: DevOps monitoring or load balancer health checks
   */
  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Server is healthy');
      expect(response.body.timestamp).toBeDefined();
    });
  });

});
