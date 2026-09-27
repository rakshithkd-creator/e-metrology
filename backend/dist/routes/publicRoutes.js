"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicController_1 = require("../controllers/publicController");
const router = (0, express_1.Router)();
// Publicly accessible endpoints (No login required)
router.get('/verify/:certIdentifier', publicController_1.publicVerifyCertificate);
router.get('/track/:applicationId', publicController_1.publicTrackApplication);
exports.default = router;
