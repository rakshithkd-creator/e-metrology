import { Router } from 'express';
import { publicVerifyCertificate, publicTrackApplication } from '../controllers/publicController';

const router = Router();

// Publicly accessible endpoints (No login required)
router.get('/verify/:certIdentifier', publicVerifyCertificate);
router.get('/track/:applicationId', publicTrackApplication);

export default router;
