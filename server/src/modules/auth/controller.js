import * as authService from './service.js';
import { registerSchema, loginSchema, refreshSchema } from './validator.js';

export async function register(req, res) {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerUser(data);
  res.status(201).json({ success: true, data: result });
}

export async function login(req, res) {
  const data = loginSchema.parse(req.body);
  const result = await authService.loginUser(data);
  res.json({ success: true, data: result });
}

export async function refresh(req, res) {
  const { refreshToken } = refreshSchema.parse(req.body);
  const result = await authService.refreshTokens(refreshToken);
  res.json({ success: true, data: result });
}
