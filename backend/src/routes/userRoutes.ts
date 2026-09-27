import { Router } from 'express';
import { listUsers, updateUserStatus, getOfficers } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

// Public to logged in users: Get officers list for scheduling
router.get('/officers', getOfficers);

// Admin-only endpoints
router.get('/', authorizeRoles('SUPER_ADMIN'), listUsers);
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN'), updateUserStatus);

export default router;
