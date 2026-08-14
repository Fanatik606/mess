import { Router } from 'express';
import { listUsersHandler, getUserHandler } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { searchUsersQuerySchema } from '../utils/validators';

const router = Router();

router.get('/', requireAuth, validate(searchUsersQuerySchema, 'query'), listUsersHandler);
router.get('/:id', requireAuth, getUserHandler);

export default router;