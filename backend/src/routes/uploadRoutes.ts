import { Router, Response } from 'express';
import { upload } from '../middleware/upload';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/single', upload.single('file'), (req: AuthenticatedRequest, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No file uploaded.' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({
    success: true,
    message: 'File uploaded successfully.',
    file: {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl,
    },
  });
});

router.post('/multiple', upload.array('files', 5), (req: AuthenticatedRequest, res: Response): void => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length === 0) {
    res.status(400).json({ success: false, message: 'No files uploaded.' });
    return;
  }

  const uploadedFiles = files.map((f) => ({
    originalName: f.originalname,
    filename: f.filename,
    size: f.size,
    mimetype: f.mimetype,
    url: `/uploads/${f.filename}`,
  }));

  res.status(201).json({
    success: true,
    message: 'Files uploaded successfully.',
    files: uploadedFiles,
  });
});

export default router;
