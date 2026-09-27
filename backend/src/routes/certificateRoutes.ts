import { Router } from 'express';
import {
  listCertificates,
  getCertificate,
  downloadCertificatePdf,
  revokeCertificate,
} from '../controllers/certificateController';
import { authenticate } from '../middleware/auth';
import { authorizeRoles } from '../middleware/rbac';

const router = Router();

// Downloading PDF can be accessed by authenticated users, or publicly if accompanied by token
router.get('/:certNumber/pdf', downloadCertificatePdf);

router.use(authenticate);

router.get('/', listCertificates);
router.get('/:certNumber', getCertificate);
router.post('/:certNumber/revoke', authorizeRoles('SUPER_ADMIN'), revokeCertificate);

export default router;
