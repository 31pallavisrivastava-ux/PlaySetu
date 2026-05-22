import * as adminService from './service.js';

export async function pendingFacilities(_req, res) {
  const data = await adminService.listPendingFacilities();
  res.json({ success: true, data });
}

export async function approveFacility(req, res) {
  const data = await adminService.approveFacility(req.params.id);
  res.json({ success: true, data });
}

export async function stats(_req, res) {
  const data = await adminService.platformStats();
  res.json({ success: true, data });
}
