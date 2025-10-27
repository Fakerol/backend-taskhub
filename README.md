# TaskHub Backend

A Node.js backend API for a task management application with authentication, project management, and task tracking features.

## Features

- ✅ User Authentication (Signup/Login)
- ✅ JWT Token-based Authentication
- ✅ Password Hashing with bcrypt
- ✅ Input Validation with Zod
- ✅ Rate Limiting
- ✅ Error Handling Middleware
- ✅ MongoDB Integration
- ✅ Project Management (Full CRUD)
- ✅ Project Member Management
- ✅ User Permissions & Access Control
- ✅ Task Management (Full CRUD)
- ✅ Task Assignment & Status Tracking
- 🔄 Activity Tracking (Coming Soon)

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for input validation
- **express-rate-limit** for rate limiting
- **helmet** for security headers
- **cors** for cross-origin requests
- **morgan** for logging

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/taskhub

   # JWT Configuration
   # IMPORTANT: Change these secrets in production!
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-minimum-32-characters
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000

   # Rate Limiting Configuration
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   AUTH_RATE_LIMIT_WINDOW_MS=900000
   AUTH_RATE_LIMIT_MAX=5
   PASSWORD_RESET_RATE_LIMIT_WINDOW_MS=3600000
   PASSWORD_RESET_RATE_LIMIT_MAX=3
   ```

   **Security Note**: Never commit your `.env` file to version control. The `.env` file should be added to `.gitignore`.

4. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Project Management

#### POST `/api/projects`
Create a new project.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "project_id",
    "name": "My Project",
    "description": "Project description",
    "owner": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "members": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/projects`
Get all projects for the authenticated user (owned or member).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for project name/description
- `sortBy` (optional): Sort field (name, createdAt, updatedAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Projects retrieved successfully",
  "data": {
    "projects": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 10
    }
  }
}
```

#### GET `/api/projects/:id`
Get a specific project by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project retrieved successfully",
  "data": {
    "_id": "project_id",
    "name": "My Project",
    "description": "Project description",
    "owner": {...},
    "members": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/projects/:id`
Update a project (owner only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### DELETE `/api/projects/:id`
Delete a project (owner only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully",
  "data": {
    "message": "Project deleted successfully"
  }
}
```

#### POST `/api/projects/:id/members`
Add a member to the project (owner only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "member@example.com"
}
```

#### DELETE `/api/projects/:id/members`
Remove a member from the project (owner only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_id_to_remove"
}
```

### Task Management

#### POST `/api/tasks`
Create a new task.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "projectId": "project_id",
  "title": "Task Title",
  "description": "Task description (optional)",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedTo": "user_id"
}
```

**Status Options:** `todo`, `in-progress`, `done`
**Priority Options:** `low`, `medium`, `high`

**Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "task_id",
    "title": "Task Title",
    "description": "Task description",
    "status": "todo",
    "priority": "medium",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "project": {
      "_id": "project_id",
      "name": "Project Name",
      "description": "Project description"
    },
    "assignedTo": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com"
    },
    "createdBy": {
      "_id": "user_id",
      "name": "Creator Name",
      "email": "creator@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET `/api/tasks`
Get all tasks for the authenticated user (based on project access).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for task title/description
- `status` (optional): Filter by status (todo, in-progress, done)
- `priority` (optional): Filter by priority (low, medium, high)
- `assignedTo` (optional): Filter by assigned user ID
- `projectId` (optional): Filter by project ID
- `sortBy` (optional): Sort field (title, status, priority, dueDate, createdAt, updatedAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 5,
      "itemsPerPage": 10
    }
  }
}
```

#### GET `/api/tasks/:id`
Get a specific task by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### PUT `/api/tasks/:id`
Update a task (task creator, project owner, or assigned user only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "status": "in-progress",
  "priority": "high",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "assignedTo": "user_id"
}
```

#### DELETE `/api/tasks/:id`
Delete a task (task creator or project owner only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

#### PATCH `/api/tasks/:id/assign`
Assign a task to a user (task creator or project owner only).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assignedTo": "user_id"
}
```

## Project Structure

```
src/
├── config/
│   └── db.js                # MongoDB connection setup
├── middleware/
│   ├── authMiddleware.js    # JWT verification, role-based access
│   ├── errorMiddleware.js   # Global error handler
│   └── rateLimiter.js       # Express-rate-limit setup
├── models/
│   ├── user.model.js        # User schema
│   ├── project.model.js     # Project schema
│   ├── task.model.js        # Task schema
│   └── activity.model.js    # Activity schema
├── dto/
│   ├── user.dto.js          # User validation schemas
│   ├── project.dto.js       # Project validation schemas
│   └── task.dto.js          # Task validation schemas
├── services/
│   ├── auth.service.js      # Authentication business logic
│   ├── project.service.js   # Project business logic
│   └── task.service.js      # Task business logic
├── controllers/
│   ├── auth.controller.js   # Authentication request handlers
│   ├── project.controller.js # Project request handlers
│   └── task.controller.js   # Task request handlers
├── routes/
│   ├── auth.routes.js       # Authentication routes
│   ├── project.routes.js    # Project routes
│   └── task.routes.js       # Task routes
├── utils/
│   ├── jwt.js               # JWT token utilities
│   └── responseHandler.js   # Unified API response format
├── app.js                   # Express app setup
└── server.js                # Entry point
```

## Testing

Run tests with:
```bash
npm test
```

## Development

The project uses:
- **ES Modules** (import/export syntax)
- **Nodemon** for development auto-restart
- **Jest** for testing
- **Supertest** for API testing

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on auth endpoints
- Input validation with Zod
- Security headers with Helmet
- CORS configuration
- Error handling without sensitive data exposure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
