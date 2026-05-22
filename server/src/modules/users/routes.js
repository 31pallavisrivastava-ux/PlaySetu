import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.use(authenticate);
router.get('/me', asyncHandler(controller.getMe));
router.patch('/me', asyncHandler(controller.updateMe));

export default router;
