import * as userService from './service.js';
import { updateProfileSchema } from './validator.js';

export async function getMe(req, res) {
  const user = await userService.getProfile(req.user.id);
  res.json({ success: true, data: user });
}

export async function updateMe(req, res) {
  const data = updateProfileSchema.parse(req.body);
  const user = await userService.updateProfile(req.user.id, data);
  res.json({ success: true, data: user });
}
