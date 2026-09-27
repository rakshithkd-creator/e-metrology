import { Router } from 'express';
import {
  getChecklistConfigs,
  updateChecklistConfigs,
  submitVerification,
} from '../controllers/verificationController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/checklists', getChecklistConfigs);
router.put('/checklists', authorizeRoles('SUPER_ADMIN'), updateChecklistConfigs);
router.post('/submit', authorizeRoles('LMO', 'GATC', 'SUPER_ADMIN'), submitVerification);

export default router;
