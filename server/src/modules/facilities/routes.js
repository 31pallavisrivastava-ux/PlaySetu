import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate, requireRole } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.get('/', asyncHandler(controller.list));
router.get('/slots', asyncHandler(controller.slots));
router.get('/:id', asyncHandler(controller.getById));

router.post('/', authenticate, requireRole('OWNER', 'ADMIN'), asyncHandler(controller.create));
router.post('/:id/courts', authenticate, requireRole('OWNER', 'ADMIN'), asyncHandler(controller.addCourt));
router.post('/slots/generate', authenticate, requireRole('OWNER', 'ADMIN'), asyncHandler(controller.generateSlots));

export default router;
