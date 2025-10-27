# 🔄 Refresh Token Implementation in TaskHub

## **📋 Overview**

TaskHub implements a **dual-token authentication system** using JWT (JSON Web Tokens) with access tokens and refresh tokens for enhanced security and user experience.

---

## **🔐 Token Types**

### **1. Access Token**
- **Purpose**: Authenticate API requests
- **Lifetime**: 15 minutes (configurable via `JWT_EXPIRES_IN`)
- **Secret**: `JWT_SECRET` environment variable
- **Payload**: `{ id: user._id, role: user.role }`
- **Usage**: Sent in `Authorization: Bearer <token>` header

### **2. Refresh Token**
- **Purpose**: Get new access tokens when they expire
- **Lifetime**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)
- **Secret**: `JWT_REFRESH_SECRET` environment variable
- **Payload**: `{ id: user._id }`
- **Usage**: Sent in request body to `/api/auth/refresh`

---

## **🔄 How Refresh Tokens Work**

### **Step 1: Login/Signup**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Step 2: Making API Requests**
```http
GET /api/projects
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Step 3: Access Token Expires (15 minutes)**
When the access token expires, API requests will return:
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### **Step 4: Refresh Access Token**
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **Step 5: Continue with New Access Token**
Use the new access token for API requests until it expires again.

---

## **🚪 Logout Process**

### **Logout Endpoint**
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Note**: In the current implementation, logout doesn't invalidate tokens server-side. The client should discard both tokens locally.

---

## **🔧 Implementation Details**

### **JWT Configuration**
```javascript
// Access Token
{
  expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  secret: process.env.JWT_SECRET
}

// Refresh Token  
{
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  secret: process.env.JWT_REFRESH_SECRET
}
```

### **Environment Variables**
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production-minimum-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## **📱 Frontend Implementation**

### **Token Storage**
```javascript
// Store tokens securely
localStorage.setItem('accessToken', response.data.accessToken);
localStorage.setItem('refreshToken', response.data.refreshToken);
```

### **API Request Interceptor**
```javascript
// Add access token to requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### **Response Interceptor for Token Refresh**
```javascript
// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          });
          
          const newAccessToken = response.data.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          
          // Retry original request
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

---

## **🔒 Security Features**

### **Current Security Measures**
- ✅ **Different Secrets**: Access and refresh tokens use different secrets
- ✅ **Short Access Token Lifetime**: 15 minutes reduces exposure window
- ✅ **Rate Limiting**: All auth endpoints have rate limiting
- ✅ **Token Validation**: Proper JWT verification
- ✅ **User Validation**: Refresh token validates user still exists

### **Security Considerations**
- ⚠️ **Token Storage**: Refresh tokens are not stored in database (no revocation)
- ⚠️ **Logout**: Current logout doesn't invalidate tokens server-side
- ⚠️ **Single Refresh Token**: No rotation (same refresh token reused)

---

## **🚀 Advanced Implementation (Future)**

### **Token Blacklist/Revocation**
```javascript
// Store refresh tokens in database
const refreshTokenSchema = new mongoose.Schema({
  token: String,
  userId: ObjectId,
  expiresAt: Date,
  isRevoked: { type: Boolean, default: false }
});

// Revoke token on logout
export const logoutUser = async (refreshToken) => {
  await RefreshToken.findOneAndUpdate(
    { token: refreshToken },
    { isRevoked: true }
  );
};
```

### **Token Rotation**
```javascript
// Generate new refresh token on each refresh
export const refreshAccessToken = async (refreshToken) => {
  // Verify old refresh token
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  // Revoke old refresh token
  await revokeRefreshToken(refreshToken);
  
  // Generate new tokens
  const user = await User.findById(decoded.id);
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
```

---

## **📊 API Endpoints Summary**

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth/login` | POST | Get access + refresh tokens | ❌ |
| `/api/auth/signup` | POST | Register + get tokens | ❌ |
| `/api/auth/refresh` | POST | Get new access token | ❌ |
| `/api/auth/logout` | POST | Logout (client-side) | ❌ |

---

## **✅ Test Results**

All refresh token functionality tested and working:

- ✅ **Login**: Returns both access and refresh tokens
- ✅ **Refresh**: Successfully generates new access token
- ✅ **Logout**: Returns success message
- ✅ **Token Validation**: Proper JWT verification
- ✅ **Error Handling**: Invalid tokens properly rejected
- ✅ **Rate Limiting**: All endpoints protected

---

## **🎯 Benefits**

1. **Enhanced Security**: Short-lived access tokens reduce exposure
2. **Better UX**: Users don't need to login frequently
3. **Scalable**: Stateless JWT tokens work across multiple servers
4. **Flexible**: Configurable token lifetimes via environment variables
5. **Standard**: Follows OAuth 2.0 refresh token pattern

The refresh token system is now fully implemented and ready for production use! 🚀
