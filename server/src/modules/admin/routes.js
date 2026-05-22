import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate, requireRole } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));
router.get('/stats', asyncHandler(controller.stats));
router.get('/facilities/pending', asyncHandler(controller.pendingFacilities));
router.patch('/facilities/:id/approve', asyncHandler(controller.approveFacility));

export default router;
