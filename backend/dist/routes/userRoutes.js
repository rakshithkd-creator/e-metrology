"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Public to logged in users: Get officers list for scheduling
router.get('/officers', userController_1.getOfficers);
// Admin-only endpoints
router.get('/', (0, rbac_1.authorizeRoles)('SUPER_ADMIN'), userController_1.listUsers);
router.patch('/:id/status', (0, rbac_1.authorizeRoles)('SUPER_ADMIN'), userController_1.updateUserStatus);
exports.default = router;
