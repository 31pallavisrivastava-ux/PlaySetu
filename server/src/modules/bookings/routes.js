import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.use(authenticate);
router.post('/', asyncHandler(controller.create));
router.get('/my', asyncHandler(controller.myBookings));
router.delete('/:id', asyncHandler(controller.cancel));

export default router;
