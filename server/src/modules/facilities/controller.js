import * as facilityService from './service.js';
import {
  createFacilitySchema,
  searchFacilitiesSchema,
  createCourtSchema,
  generateSlotsSchema,
} from './validator.js';

export async function create(req, res) {
  const data = createFacilitySchema.parse(req.body);
  const facility = await facilityService.createFacility(req.user.id, data);
  res.status(201).json({ success: true, data: facility });
}

export async function list(req, res) {
  const query = searchFacilitiesSchema.parse(req.query);
  const result = await facilityService.searchFacilities(query);
  res.json({ success: true, data: result });
}

export async function getById(req, res) {
  const facility = await facilityService.getFacilityById(req.params.id);
  res.json({ success: true, data: facility });
}

export async function addCourt(req, res) {
  const data = createCourtSchema.parse(req.body);
  const court = await facilityService.createCourt(req.params.id, req.user.id, data);
  res.status(201).json({ success: true, data: court });
}

export async function generateSlots(req, res) {
  const data = generateSlotsSchema.parse(req.body);
  const slots = await facilityService.generateSlots(req.user.id, data);
  res.status(201).json({ success: true, data: slots });
}

export async function slots(req, res) {
  const { courtId, date } = req.query;
  const available = await facilityService.getAvailableSlots(courtId, date);
  res.json({ success: true, data: available });
}
