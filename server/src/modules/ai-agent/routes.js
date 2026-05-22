import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import { authenticate } from '../auth/middleware.js';
import * as controller from './controller.js';

const router = Router();

router.use(authenticate);
router.post('/chat', asyncHandler(controller.chat));
router.post('/recommend', asyncHandler(controller.recommend));
router.post('/book', asyncHandler(controller.book));

export default router;
