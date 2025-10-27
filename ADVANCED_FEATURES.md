# 🚀 TaskHub Advanced Features Documentation

## ✅ **All Advanced Features Are Already Implemented!**

The Task CRUD system includes comprehensive advanced features for filtering, searching, sorting, and pagination. Here's how to use them:

---

## **🔍 1. Filtering Features**

### **Filter by Status**
```
GET /api/tasks?status=todo
GET /api/tasks?status=in-progress  
GET /api/tasks?status=done
```

### **Filter by Priority**
```
GET /api/tasks?priority=low
GET /api/tasks?priority=medium
GET /api/tasks?priority=high
```

### **Filter by Assigned User**
```
GET /api/tasks?assignedTo=USER_ID
```

### **Filter by Project**
```
GET /api/tasks?projectId=PROJECT_ID
```

---

## **🔎 2. Search Features**

### **Search by Title and Description**
```
GET /api/tasks?search=keyword
GET /api/tasks?search=High Priority
GET /api/tasks?search=urgent
```

**Features:**
- Case-insensitive search
- Searches both title and description fields
- Uses MongoDB regex with "i" flag for case-insensitive matching

---

## **📊 3. Sorting Features**

### **Sort by Multiple Fields**
```
GET /api/tasks?sortBy=title&sortOrder=asc
GET /api/tasks?sortBy=priority&sortOrder=desc
GET /api/tasks?sortBy=dueDate&sortOrder=asc
GET /api/tasks?sortBy=createdAt&sortOrder=desc
GET /api/tasks?sortBy=updatedAt&sortOrder=desc
GET /api/tasks?sortBy=status&sortOrder=asc
```

**Available Sort Fields:**
- `title` - Task title
- `status` - Task status (todo, in-progress, done)
- `priority` - Task priority (low, medium, high)
- `dueDate` - Due date
- `createdAt` - Creation date
- `updatedAt` - Last update date

**Sort Orders:**
- `asc` - Ascending
- `desc` - Descending (default)

---

## **📄 4. Pagination Features**

### **Basic Pagination**
```
GET /api/tasks?page=1&limit=10
GET /api/tasks?page=2&limit=5
```

**Response includes pagination metadata:**
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "data": {
    "tasks": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

## **🎯 5. Combined Advanced Features**

### **Complex Queries**
```
# Get high priority tasks, sorted by due date, with pagination
GET /api/tasks?priority=high&sortBy=dueDate&sortOrder=asc&page=1&limit=5

# Search for "urgent" tasks that are in-progress
GET /api/tasks?search=urgent&status=in-progress

# Get tasks assigned to specific user, sorted by priority
GET /api/tasks?assignedTo=USER_ID&sortBy=priority&sortOrder=desc

# Get tasks from specific project, filtered by status, with pagination
GET /api/tasks?projectId=PROJECT_ID&status=todo&page=1&limit=3
```

---

## **📋 6. Complete Query Parameters Reference**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10) | `?limit=5` |
| `search` | string | Search in title/description | `?search=urgent` |
| `status` | enum | Filter by status | `?status=todo` |
| `priority` | enum | Filter by priority | `?priority=high` |
| `assignedTo` | string | Filter by assigned user | `?assignedTo=USER_ID` |
| `projectId` | string | Filter by project | `?projectId=PROJECT_ID` |
| `sortBy` | enum | Sort field | `?sortBy=priority` |
| `sortOrder` | enum | Sort direction | `?sortOrder=asc` |

---

## **🔐 7. Security & Permissions**

**All advanced features respect:**
- ✅ **Authentication Required** - Must provide valid JWT token
- ✅ **Project-Based Access** - Users only see tasks from projects they're members of
- ✅ **Role-Based Permissions** - Proper access control for all operations
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Input Validation** - All parameters validated with Zod schemas

---

## **🧪 8. Testing Examples**

### **Postman Collection Examples:**

**1. Get all high priority tasks:**
```
GET /api/tasks?priority=high
Authorization: Bearer YOUR_TOKEN
```

**2. Search for urgent tasks:**
```
GET /api/tasks?search=urgent
Authorization: Bearer YOUR_TOKEN
```

**3. Get tasks sorted by due date:**
```
GET /api/tasks?sortBy=dueDate&sortOrder=asc
Authorization: Bearer YOUR_TOKEN
```

**4. Paginated results:**
```
GET /api/tasks?page=1&limit=3
Authorization: Bearer YOUR_TOKEN
```

**5. Complex filtering:**
```
GET /api/tasks?status=in-progress&priority=high&sortBy=dueDate&sortOrder=asc&page=1&limit=5
Authorization: Bearer YOUR_TOKEN
```

---

## **✅ Test Results**

All advanced features have been tested and are working perfectly:

- ✅ **Status Filtering**: Returns only tasks with specified status
- ✅ **Priority Filtering**: Returns only tasks with specified priority  
- ✅ **Search**: Case-insensitive search in title and description
- ✅ **Sorting**: Works with all available fields and directions
- ✅ **Pagination**: Proper page limits and metadata
- ✅ **Combined Filters**: Multiple filters work together seamlessly
- ✅ **Security**: All features respect authentication and permissions

---

## **🎉 Summary**

The TaskHub backend already includes **all the advanced features** you requested:

1. **✅ Filtering**: By status, priority, assigned user, project
2. **✅ Search**: By title and description (case-insensitive)
3. **✅ Sorting**: By multiple fields (title, status, priority, dueDate, createdAt, updatedAt)
4. **✅ Pagination**: Full pagination support with metadata

**All features are production-ready and fully tested!** 🚀
