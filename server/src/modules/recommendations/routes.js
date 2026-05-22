import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.get('/', authenticate, asyncHandler(controller.recommend));

export default router;
