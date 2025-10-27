import { signupSchema, loginSchema } from "../dto/user.dto.js";
import { registerUser, loginUser, refreshAccessToken, logoutUser } from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/responseHandler.js";

export const signup = async (req, res) => {
  try {
    const validated = signupSchema.parse(req.body);
    const result = await registerUser(validated);
    return successResponse(res, "User registered successfully", result, 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const login = async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const result = await loginUser(validated);
    return successResponse(res, "Login successful", result);
  } catch (error) {
    return errorResponse(res, error.message, 400);
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
