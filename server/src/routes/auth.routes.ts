import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  meHandler,
  updateProfileHandler,
} from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, registerSchema, updateProfileSchema } from '../utils/validators';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.get('/me', requireAuth, meHandler);
router.put('/profile', requireAuth, validate(updateProfileSchema), updateProfileHandler);

export default router;