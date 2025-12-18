# MERN Stack Todo List Application

A complete full-stack Todo List web application built with the MERN stack (MongoDB, Express.js, React, Node.js) and styled with Tailwind CSS.

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

## 🧪 Testing the API

You can test the API endpoints using **Postman** or any other API testing tool:

### Examples:

1. **Create a Task** (POST `/api/tasks`):
   ```json
   {
     "title": "Learn React",
     "description": "Complete React tutorial",
     "priority": "High",
     "dueDate": "2024-01-20"
   }
   ```

2. **Update a Task** (PUT `/api/tasks/:id`):
   ```json
   {
     "completed": true
   }
   ```

## 🎨 UI Features

### Task Form
- Create new tasks or edit existing ones
- Form validation with error messages
- Priority selection (Low, Medium, High)
- Optional due date picker
- Character limits for title and description

### Task List
- Search functionality
- Filter by status (All, Active, Completed)
- Sort by multiple criteria (Newest, Oldest, Priority, Due Date)
- Task statistics dashboard
- Responsive grid layout

### Task Items
- One-click completion toggle
- Priority indicators with color coding
- Due date display with overdue warnings
- Edit and delete actions
- Confirmation dialogs for destructive actions

## 🔧 Development

### Available Scripts

#### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

#### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Environment Variables

The backend uses the following environment variables (already configured):
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Frontend Deployment
1. Build the project: `npm run build`
2. Serve the `build` folder using a static file server

## 🤝 Frontend-Backend Connection

The frontend connects to the backend through:
1. **Proxy Configuration**: `package.json` includes `"proxy": "http://localhost:5000"`
2. **Axios Service**: Centralized API service in `taskService.ts`
3. **Error Handling**: Comprehensive error handling with user notifications
4. **State Management**: React hooks for state management

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop** (1024px+)
- **Tablet** (768px - 1024px)
- **Mobile** (320px - 768px)

## 🎯 Key Learning Points

This project demonstrates:
- Full-stack development with MERN stack
- RESTful API design and implementation
- MongoDB database operations with Mongoose
- Modern React development with TypeScript
- Tailwind CSS for rapid UI development
- Error handling and user experience
- Form validation and state management
- Responsive web design principles

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

**Happy Coding! 🚀**