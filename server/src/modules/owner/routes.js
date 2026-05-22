import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate, requireRole } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.use(authenticate, requireRole('OWNER', 'ADMIN'));

router.get('/summary', asyncHandler(controller.summary));
router.get('/facilities', asyncHandler(controller.facilities));
router.post('/facilities', asyncHandler(controller.createFacility));
router.get('/facilities/:id', asyncHandler(controller.facilityById));
router.patch('/facilities/:id', asyncHandler(controller.updateFacility));
router.patch('/facilities/:id/status', asyncHandler(controller.setFacilityStatus));
router.delete('/facilities/:id', asyncHandler(controller.deleteFacility));
router.get('/bookings', asyncHandler(controller.bookings));
router.get('/slots', asyncHandler(controller.slots));

export default router;
