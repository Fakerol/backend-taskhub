import rateLimit from "express-rate-limit";

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS),
  limit: parseInt(process.env.RATE_LIMIT_MAX),
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Auth rate limiter (stricter for login/signup)
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS),
  limit: parseInt(process.env.AUTH_RATE_LIMIT_MAX),
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_WINDOW_MS),
  limit: parseInt(process.env.PASSWORD_RESET_RATE_LIMIT_MAX),
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  }
});
