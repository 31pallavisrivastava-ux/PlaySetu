import * as ownerService from './service.js';
import {
  ownerQuerySchema,
  createOwnerFacilitySchema,
  updateOwnerFacilitySchema,
  facilityStatusSchema,
} from './validator.js';

export async function summary(req, res) {
  const data = await ownerService.getOwnerSummary(req.user.id);
  res.json({ success: true, data });
}

export async function facilities(req, res) {
  const data = await ownerService.getOwnerFacilities(req.user.id);
  res.json({ success: true, data });
}

export async function facilityById(req, res) {
  const data = await ownerService.getOwnerFacilityById(req.user.id, req.params.id);
  res.json({ success: true, data });
}

export async function createFacility(req, res) {
  const body = createOwnerFacilitySchema.parse(req.body);
  const data = await ownerService.createOwnerFacility(req.user.id, body);
  res.status(201).json({ success: true, data });
}

export async function updateFacility(req, res) {
  const body = updateOwnerFacilitySchema.parse(req.body);
  const data = await ownerService.updateOwnerFacility(req.user.id, req.params.id, body);
  res.json({ success: true, data });
}

export async function setFacilityStatus(req, res) {
  const { status } = facilityStatusSchema.parse(req.body);
  const data = await ownerService.setOwnerFacilityStatus(req.user.id, req.params.id, status);
  res.json({ success: true, data });
}

export async function deleteFacility(req, res) {
  const data = await ownerService.deleteOwnerFacility(req.user.id, req.params.id);
  res.json({ success: true, data });
}

export async function bookings(req, res) {
  const query = ownerQuerySchema.parse(req.query);
  const data = await ownerService.getOwnerBookings(req.user.id, query);
  res.json({ success: true, data });
}

export async function slots(req, res) {
  const query = ownerQuerySchema.parse(req.query);
  const data = await ownerService.getOwnerSlots(req.user.id, query);
  res.json({ success: true, data });
}
