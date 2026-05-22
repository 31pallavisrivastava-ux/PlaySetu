import * as analyticsService from './service.js';

export async function ownerDashboard(req, res) {
  const data = await analyticsService.ownerDashboard(req.user.id);
  res.json({ success: true, data });
}
