import { Router } from 'express';
import { exportReportCsv } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticate);
router.get('/export/:reportType', authorizeRoles('SUPER_ADMIN'), exportReportCsv);

export default router;
