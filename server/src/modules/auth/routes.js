import { Router } from 'express';
import { asyncHandler } from '../../shared/helpers/asyncHandler.js';
import * as controller from './controller.js';

const router = Router();

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));

export default router;
