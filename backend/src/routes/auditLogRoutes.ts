import { Router } from 'express';
import { listAuditLogs } from '../controllers/auditLogController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.get('/', authorizeRoles('SUPER_ADMIN'), listAuditLogs);

export default router;
