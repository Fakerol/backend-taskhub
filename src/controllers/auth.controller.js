import { signupSchema, loginSchema } from "../dto/user.dto.js";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";
import { ZodError } from "zod";

export const signup = async (req, res) => {
  try {
    const validated = signupSchema.parse(req.body);
    const result = await registerUser(validated);
    return successResponse(res, "User registered successfully", result, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle Zod validation errors
      let errorMessage = 'Validation failed';
      
      // Try different ways to access Zod error details
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.map(err => err.message).join(', ');
      } else if (error.issues && Array.isArray(error.issues)) {
        errorMessage = error.issues.map(issue => issue.message).join(', ');
      } else if (error.message) {
        // If error.message contains the validation details, extract them
        try {
          // The error.message is a JSON string, parse it
          const parsed = JSON.parse(error.message);
          if (Array.isArray(parsed)) {
            errorMessage = parsed.map(err => err.message).join(', ');
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If parsing fails, try to extract message from the string directly
          const match = error.message.match(/"message":\s*"([^"]+)"/);
          if (match) {
            errorMessage = match[1];
          } else {
            errorMessage = error.message;
          }
        }
      }
      
      return errorResponse(res, errorMessage, 400);
    }
    return errorResponse(res, error.message || 'An error occurred', 400);
  }
};

export const login = async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await loginUser(validated);
    return successResponse(res, "Login successful", result);
  } catch (error) {
    if (error instanceof ZodError) {
      // Handle Zod validation errors
      let errorMessage = 'Validation failed';
      
      // Try different ways to access Zod error details
      if (error.errors && Array.isArray(error.errors)) {
        errorMessage = error.errors.map(err => err.message).join(', ');
      } else if (error.issues && Array.isArray(error.issues)) {
        errorMessage = error.issues.map(issue => issue.message).join(', ');
      } else if (error.message) {
        // If error.message contains the validation details, extract them
        try {
          // The error.message is a JSON string, parse it
          const parsed = JSON.parse(error.message);
          if (Array.isArray(parsed)) {
            errorMessage = parsed.map(err => err.message).join(', ');
          } else {
            errorMessage = error.message;
          }
        } catch (parseError) {
          // If parsing fails, try to extract message from the string directly
          const match = error.message.match(/"message":\s*"([^"]+)"/);
          if (match) {
            errorMessage = match[1];
          } else {
            errorMessage = error.message;
          }
        }
      }
      
      return errorResponse(res, errorMessage, 400);
    }
    return errorResponse(res, error.message || 'An error occurred', 400);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return errorResponse(res, "Refresh token is required", 400);
    }

    const result = await refreshAccessToken(refreshToken);
    return successResponse(res, "Token refreshed successfully", result);
  } catch (error) {
    return errorResponse(res, error.message, 401);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return errorResponse(res, "Refresh token is required", 400);
    }

    const result = await logoutUser(refreshToken);
    return successResponse(res, result.message, result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
