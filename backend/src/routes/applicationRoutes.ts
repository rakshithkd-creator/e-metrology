import { Router } from 'express';
import {
  listApplications,
  createApplication,
  getApplication,
  assignAndSchedule,
  reviewApplication,
} from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', listApplications);
router.post('/', authorizeRoles('BUSINESS_USER', 'SUPER_ADMIN'), createApplication);
router.get('/:id', getApplication);
router.post('/:id/review', authorizeRoles('SUPER_ADMIN'), reviewApplication);
router.post('/:id/schedule', authorizeRoles('SUPER_ADMIN'), assignAndSchedule);

export default router;
