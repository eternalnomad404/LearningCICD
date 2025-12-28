import React, { useState, useEffect, useCallback } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import taskService, { Task } from './services/taskService';
import './index.css';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  
  // Admin ETL state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [isETLLoading, setIsETLLoading] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await taskService.getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
      showNotification('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleCreateTask = async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newTask = await taskService.createTask(taskData);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      showNotification('Task created successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      showNotification('Failed to create task', 'error');
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updatedTask = await taskService.updateTask(id, updates);
      setTasks(prevTasks =>
        prevTasks.map(task => (task._id === id ? updatedTask : task))
      );
      
      if (editingTask && editingTask._id === id) {
        setEditingTask(null);
      }
      
      showNotification('Task updated successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
      showNotification('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== id));
      showNotification('Task deleted successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
      showNotification('Failed to delete task', 'error');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    // Scroll to top where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleSubmitEdit = async (taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTask) {
      await handleUpdateTask(editingTask._id!, taskData);
    }
  };

  // ETL Trigger Function
  const handleTriggerETL = async () => {
    if (!adminToken.trim()) {
      showNotification('Please enter admin token', 'error');
      return;
    }

    try {
      setIsETLLoading(true);
      const result = await taskService.triggerETL(adminToken);
      
      if (result.success) {
        showNotification('ETL workflow triggered successfully!', 'success');
        console.log('ETL triggered:', result.data);
      } else {
        showNotification(result.message || 'Failed to trigger ETL', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to trigger ETL workflow', 'error');
    } finally {
      setIsETLLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CI/CD Deployment Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center space-x-2 text-sm font-medium">
            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>🚀 Deployed via CI/CD Pipeline | GitHub Actions → Docker Hub → Netlify</span>
            <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              📝 Todo List - Production Ready
            </h1>
            <p className="mt-2 text-gray-600">
              Full-stack MERN app with automated CI/CD pipeline | Live on Netlify ⚡
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg max-w-md ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setNotification(null)}
                    className={`inline-flex p-1.5 rounded-md hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success'
                        ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                        : 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                    }`}
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Display */}
        {error && !notification && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Panel */}
        <div className="mb-6">
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="mb-4 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors duration-200"
          >
            {showAdminPanel ? '🔧 Hide Admin Panel' : '🔧 Show Admin Panel'}
          </button>
          
          {showAdminPanel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                📊 Data Synchronization
              </h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="admin-token" className="block text-sm font-medium text-blue-700 mb-1">
                    Admin Token
                  </label>
                  <input
                    id="admin-token"
                    type="password"
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    placeholder="Enter admin token"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isETLLoading}
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleTriggerETL}
                    disabled={isETLLoading || !adminToken.trim()}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                      isETLLoading || !adminToken.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isETLLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Triggering...</span>
                      </div>
                    ) : (
                      '🚀 Sync Data'
                    )}
                  </button>
                  
                  {isETLLoading && (
                    <p className="text-sm text-blue-600">
                      Starting ETL workflow in GitHub Actions...
                    </p>
                  )}
                </div>
                <p className="text-xs text-blue-600">
                  This will trigger a GitHub Actions workflow to process and synchronize the task data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Task Form */}
        <TaskForm
          onSubmit={editingTask ? handleSubmitEdit : handleCreateTask}
          initialTask={editingTask}
          onCancel={editingTask ? handleCancelEdit : undefined}
          isEditing={!!editingTask}
        />

        {/* Task List */}
        <TaskList
          tasks={tasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleEditTask}
          loading={loading}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Built with ❤️ using React, Node.js, Express, and MongoDB
            </p>
            <p className="text-xs mt-1">
              MERN Stack Todo Application
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;