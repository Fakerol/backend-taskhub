import { signupSchema, loginSchema } from "../dto/user.dto.js";
import { registerUser, loginUser } from "../services/auth.service.js";
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
