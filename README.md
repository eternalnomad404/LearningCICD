# 📝 MERN Stack Todo List Application

A production-ready full-stack Todo List application with automated CI/CD pipeline, built with the MERN stack (MongoDB, Express.js, React, Node.js) and styled with Tailwind CSS.

[![CI](https://github.com/YOUR-USERNAME/to-do-list/workflows/CI/badge.svg)](https://github.com/YOUR-USERNAME/to-do-list/actions)

## 🚀 Features

- **Full CRUD Operations**: Create, Read, Update, and Delete tasks
- **Real-time UI Updates**: Seamless interaction with MongoDB database
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Task Management**: 
  - Add new tasks with title, description, priority, and due date
  - Mark tasks as completed/incomplete
  - Edit existing tasks
  - Delete tasks with confirmation
  - Search and filter tasks
  - Sort by various criteria (date, priority, etc.)
- **Task Analytics**: View task statistics (total, active, completed, overdue)
- **Priority System**: High, Medium, Low priority levels
- **Due Date Tracking**: Visual indicators for overdue tasks
- **Error Handling**: Comprehensive error handling with user-friendly notifications

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **nodemon** - Development auto-restart

### Frontend
- **React 18** - Frontend library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

## 📁 Project Structure

```
to-do-list/
├── backend/
│   ├── controllers/
│   │   └── taskController.js
│   ├── models/
│   │   └── Task.js
│   ├── routes/
│   │   └── taskRoutes.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   └── TaskList.tsx
│   │   ├── services/
│   │   │   └── taskService.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (via MongoDB Atlas or local installation)

### Installation & Setup

1. **Clone the repository** (if using Git):
   ```bash
   git clone <repository-url>
   cd to-do-list
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**:
   The `.env` file is already configured with the MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://eternalnomad:Killer@921136@nodeexpressprojects.2ozpphb.mongodb.net/?appName=NodeExpressProjects
   PORT=5000
   ```

4. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server**:
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 📡 API Endpoints

The backend exposes the following REST API endpoints:

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/tasks` | Get all tasks |
| GET    | `/tasks/:id` | Get a single task by ID |
| POST   | `/tasks` | Create a new task |
| PUT    | `/tasks/:id` | Update a task by ID |
| DELETE | `/tasks/:id` | Delete a task by ID |

### API Response Format

```json
{
  "success": true,
  "data": { ... },
  "count": 1
}
```

### Task Data Model

```json
{
  "_id": "64a7b8c9d1e2f3a4b5c6d7e8",
  "title": "Complete project",
  "description": "Finish the MERN stack todo application",
  "completed": false,
  "priority": "High",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "createdAt": "2024-01-10T10:30:00.000Z",
  "updatedAt": "2024-01-10T10:30:00.000Z"
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### API Testing
Test endpoints using **Postman** or **curl**:

```bash
# Health check
curl http://localhost:5000/api/health

# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn React","priority":"High"}'

# Get all tasks
curl http://localhost:5000/api/tasks
```

## 🚀 CI/CD Pipeline

This project includes a production-grade CI/CD pipeline:

- **CI (GitHub Actions)**: Automated testing on every push/PR
- **CD (Render)**: Automatic deployment when tests pass

📖 **Full CI/CD Documentation**: See [CICD.md](CICD.md)

## 🌐 Deployment

### Quick Deploy to Render

1. **Push code to GitHub**
2. **Tests run automatically** (GitHub Actions)
3. **Deploy to Render** (if tests pass)

📖 **Step-by-step guide**: See [CICD.md](CICD.md)

### Environment Variables (Production)

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/todolist
PORT=5000  # Auto-set by Render
```

## 🎨 UI Features

### Task Form
- Create new tasks or edit existing ones
- Form validation with error messages
- Priority selection (Low, Medium, High)
- Optional due date picker

### Task List
- Search functionality
- Filter by status (All, Active, Completed)
- Sort by multiple criteria
- Task statistics dashboard
- Responsive grid layout

### Task Items
- One-click completion toggle
- Priority indicators with color coding
- Due date display with overdue warnings
- Edit and delete actions

## 📱 Responsive Design

Fully responsive and works on:
- **Desktop** (1024px+)
- **Tablet** (768px - 1024px)
- **Mobile** (320px - 768px)

## 🔧 Development Scripts

### Backend
```bash
npm start       # Production server
npm run dev     # Development with nodemon
npm test        # Run tests
```

### Frontend
```bash
npm start       # Development server
npm run build   # Production build
npm test        # Run tests
```

## 🎯 Key Features Demonstrated

- Full-stack MERN development
- RESTful API design
- MongoDB with Mongoose ODM
- Modern React with TypeScript
- Tailwind CSS styling
- Automated testing with Jest
- CI/CD with GitHub Actions & Render
- Production-grade error handling
- Environment-based configuration

## 📚 Documentation

- **[CICD.md](CICD.md)** - Complete CI/CD pipeline documentation

## 📝 License

MIT License - Open source and free to use.

---

**Happy Coding! 🚀**