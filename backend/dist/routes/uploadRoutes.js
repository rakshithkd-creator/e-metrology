"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/single', upload_1.upload.single('file'), (req, res) => {
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
router.post('/multiple', upload_1.upload.array('files', 5), (req, res) => {
    const files = req.files || [];
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
exports.default = router;
