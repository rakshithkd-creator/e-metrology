import { Router } from 'express';
import {
  listInstruments,
  createInstrument,
  getInstrument,
  listInstrumentTypes,
  createInstrumentType,
} from '../controllers/instrumentController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

router.use(authenticate);

router.get('/', listInstruments);
router.post('/', authorizeRoles('BUSINESS_USER', 'SUPER_ADMIN'), createInstrument);
router.get('/types', listInstrumentTypes);
router.post('/types', authorizeRoles('SUPER_ADMIN'), createInstrumentType);
router.get('/:id', getInstrument);

export default router;
