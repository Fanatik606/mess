import { Router } from 'express';
import {
  listChatsHandler,
  createChatHandler,
  getChatHandler,
} from '../controllers/chat.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createChatSchema } from '../utils/validators';

const router = Router();

router.get('/', requireAuth, listChatsHandler);
router.post('/', requireAuth, validate(createChatSchema), createChatHandler);
router.get('/:id', requireAuth, getChatHandler);

export default router;