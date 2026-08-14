import { Router } from 'express';
import { sendMessageHandler, getMessagesHandler } from '../controllers/message.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { listMessagesQuerySchema, sendMessageSchema } from '../utils/validators';

const router = Router({ mergeParams: true });

router.get('/', requireAuth, validate(listMessagesQuerySchema, 'query'), getMessagesHandler);
router.post('/', requireAuth, validate(sendMessageSchema), sendMessageHandler);

export default router;