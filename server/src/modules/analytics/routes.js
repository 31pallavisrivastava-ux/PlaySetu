import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate, requireRole } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.get('/owner', authenticate, requireRole('OWNER', 'ADMIN'), asyncHandler(controller.ownerDashboard));

export default router;
