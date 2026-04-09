import express from 'express';
import { getOrCreateSession, getSessionMessages, getActiveSessions } from '../controllers/liveSupportController.js';

const router = express.Router();

router.post('/session', getOrCreateSession);
router.get('/session/:sessionId/messages', getSessionMessages);
// Express 5 / path-to-regexp no longer supports `:param?` optional params.
// Keep behavior by providing both routes.
router.get('/sessions/active', getActiveSessions);
router.get('/sessions/active/department/:departmentId', getActiveSessions);
router.get('/sessions/active/:organizationId', getActiveSessions);

export default router;
