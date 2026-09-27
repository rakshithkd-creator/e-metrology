"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificateController_1 = require("../controllers/certificateController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
// Downloading PDF can be accessed by authenticated users, or publicly if accompanied by token
router.get('/:certNumber/pdf', certificateController_1.downloadCertificatePdf);
router.use(auth_1.authenticate);
router.get('/', certificateController_1.listCertificates);
router.get('/:certNumber', certificateController_1.getCertificate);
router.post('/:certNumber/revoke', (0, rbac_1.authorizeRoles)('SUPER_ADMIN'), certificateController_1.revokeCertificate);
exports.default = router;
