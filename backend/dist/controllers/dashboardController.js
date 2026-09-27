"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
const prisma_1 = require("../lib/prisma");
async function getDashboardStats(req, res) {
    try {
        const userRole = req.user.role;
        const userId = req.user.userId;
        const now = new Date();
        const in30Days = new Date();
        in30Days.setDate(now.getDate() + 30);
        if (userRole === 'SUPER_ADMIN') {
            // Admin Dashboard
            const [totalInstruments, totalApplications, pendingApplications, scheduledInspections, completedVerifications, certificatesIssued, expiredCertificates, expiringSoonCertificates, allApplications, allCertificates, allInspections, allOfficers,] = await Promise.all([
                prisma_1.prisma.instrument.count(),
                prisma_1.prisma.application.count(),
                prisma_1.prisma.application.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] } } }),
                prisma_1.prisma.application.count({ where: { status: 'SCHEDULED' } }),
                prisma_1.prisma.application.count({ where: { status: { in: ['VERIFIED', 'CERTIFICATE_ISSUED'] } } }),
                prisma_1.prisma.certificate.count(),
                prisma_1.prisma.certificate.count({ where: { OR: [{ status: 'EXPIRED' }, { validUntil: { lt: now } }] } }),
                prisma_1.prisma.certificate.count({
                    where: {
                        status: { not: 'REVOKED' },
                        validUntil: { gte: now, lte: in30Days },
                    },
                }),
                prisma_1.prisma.application.findMany({
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        verificationType: true,
                        instrument: { select: { category: true, district: true } },
                    },
                }),
                prisma_1.prisma.certificate.findMany({
                    select: {
                        status: true,
                        validUntil: true,
                    },
                }),
                prisma_1.prisma.verificationInspection.findMany({
                    select: {
                        result: true,
                        verificationDate: true,
                    },
                }),
                prisma_1.prisma.user.findMany({
                    where: { role: 'LMO', status: 'APPROVED' },
                    select: {
                        id: true,
                        fullName: true,
                        district: true,
                        _count: {
                            select: {
                                assignedApplications: true,
                                inspections: true,
                            },
                        },
                    },
                }),
            ]);
            // Category breakdown
            const categoryMap = {};
            for (const app of allApplications) {
                const cat = app.instrument?.category || 'OTHER';
                categoryMap[cat] = (categoryMap[cat] || 0) + 1;
            }
            const categoryBreakdown = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));
            // District breakdown
            const districtMap = {};
            for (const app of allApplications) {
                const dist = app.instrument?.district || 'Other';
                districtMap[dist] = (districtMap[dist] || 0) + 1;
            }
            const districtBreakdown = Object.entries(districtMap).map(([district, count]) => ({ district, count }));
            // Status breakdown
            const statusMap = {};
            for (const app of allApplications) {
                statusMap[app.status] = (statusMap[app.status] || 0) + 1;
            }
            const statusBreakdown = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
            // Pass vs Fail
            let passCount = 0;
            let failCount = 0;
            for (const insp of allInspections) {
                if (insp.result === 'PASS')
                    passCount++;
                else
                    failCount++;
            }
            // Officer Workload
            const officerWorkload = allOfficers.map((o) => ({
                name: o.fullName,
                district: o.district || 'Unassigned',
                assigned: o._count.assignedApplications,
                completed: o._count.inspections,
            }));
            // Applications by Month (past 6 months)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyMap = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
                monthlyMap[key] = 0;
            }
            for (const app of allApplications) {
                const d = new Date(app.createdAt);
                const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
                if (monthlyMap[key] !== undefined) {
                    monthlyMap[key]++;
                }
            }
            const applicationsByMonth = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }));
            res.json({
                success: true,
                role: 'SUPER_ADMIN',
                cards: {
                    totalInstruments,
                    totalApplications,
                    pendingApplications,
                    scheduledInspections,
                    completedVerifications,
                    certificatesIssued,
                    expiringSoonCertificates,
                    expiredCertificates,
                },
                charts: {
                    categoryBreakdown,
                    districtBreakdown,
                    statusBreakdown,
                    passVsFail: { pass: passCount, fail: failCount },
                    officerWorkload,
                    applicationsByMonth,
                },
            });
            return;
        }
        if (userRole === 'LMO') {
            // LMO Dashboard
            const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            const [assignedTotal, todayInspections, upcomingInspections, pendingInspections, completedVerifications, failedVerifications, myInspectionsList, assignedAppsList,] = await Promise.all([
                prisma_1.prisma.application.count({ where: { assignedOfficerId: userId } }),
                prisma_1.prisma.application.count({
                    where: {
                        assignedOfficerId: userId,
                        scheduledDate: { gte: startOfToday, lte: endOfToday },
                    },
                }),
                prisma_1.prisma.application.count({
                    where: {
                        assignedOfficerId: userId,
                        scheduledDate: { gt: endOfToday },
                    },
                }),
                prisma_1.prisma.application.count({
                    where: {
                        assignedOfficerId: userId,
                        status: { in: ['ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS'] },
                    },
                }),
                prisma_1.prisma.verificationInspection.count({
                    where: { officerId: userId, result: 'PASS' },
                }),
                prisma_1.prisma.verificationInspection.count({
                    where: { officerId: userId, result: 'FAIL' },
                }),
                prisma_1.prisma.verificationInspection.findMany({
                    where: { officerId: userId },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        instrument: { select: { instrumentId: true, type: true, manufacturer: true } },
                        certificate: { select: { certificateNumber: true, status: true } },
                    },
                }),
                prisma_1.prisma.application.findMany({
                    where: {
                        assignedOfficerId: userId,
                        status: { in: ['ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS'] },
                    },
                    take: 6,
                    orderBy: { scheduledDate: 'asc' },
                    include: {
                        instrument: true,
                        user: { select: { fullName: true, organizationName: true, phone: true } },
                    },
                }),
            ]);
            res.json({
                success: true,
                role: 'LMO',
                cards: {
                    assignedTotal,
                    todayInspections,
                    upcomingInspections,
                    pendingInspections,
                    completedVerifications,
                    failedVerifications,
                },
                recentInspections: myInspectionsList,
                scheduledInspections: assignedAppsList,
            });
            return;
        }
        if (userRole === 'GATC') {
            const [assignedApps, completedCount, pendingList] = await Promise.all([
                prisma_1.prisma.application.count({ where: { assignedGatcId: userId } }),
                prisma_1.prisma.application.count({ where: { assignedGatcId: userId, status: 'CERTIFICATE_ISSUED' } }),
                prisma_1.prisma.application.findMany({
                    where: { assignedGatcId: userId },
                    include: { instrument: true, user: true },
                    take: 10,
                }),
            ]);
            res.json({
                success: true,
                role: 'GATC',
                cards: {
                    assignedApplications: assignedApps,
                    completedTests: completedCount,
                    pendingTests: assignedApps - completedCount,
                },
                pendingList,
            });
            return;
        }
        // Business User Dashboard
        const [registeredInstruments, activeCertificates, pendingApplications, upcomingVerifications, expiringCertificates, expiredCertificates, recentCertificates, activeApplications,] = await Promise.all([
            prisma_1.prisma.instrument.count({ where: { ownerId: userId } }),
            prisma_1.prisma.certificate.count({ where: { issuedToUserId: userId, status: 'ACTIVE' } }),
            prisma_1.prisma.application.count({
                where: {
                    userId,
                    status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ASSIGNED', 'SCHEDULED'] },
                },
            }),
            prisma_1.prisma.application.count({
                where: {
                    userId,
                    status: 'SCHEDULED',
                    scheduledDate: { gte: now },
                },
            }),
            prisma_1.prisma.certificate.count({
                where: {
                    issuedToUserId: userId,
                    status: { not: 'REVOKED' },
                    validUntil: { gte: now, lte: in30Days },
                },
            }),
            prisma_1.prisma.certificate.count({
                where: {
                    issuedToUserId: userId,
                    OR: [{ status: 'EXPIRED' }, { validUntil: { lt: now } }],
                },
            }),
            prisma_1.prisma.certificate.findMany({
                where: { issuedToUserId: userId },
                take: 5,
                orderBy: { validUntil: 'desc' },
                include: {
                    instrument: { select: { instrumentId: true, type: true, model: true } },
                },
            }),
            prisma_1.prisma.application.findMany({
                where: { userId },
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    instrument: { select: { instrumentId: true, type: true } },
                    assignedOfficer: { select: { fullName: true } },
                },
            }),
        ]);
        res.json({
            success: true,
            role: 'BUSINESS_USER',
            cards: {
                registeredInstruments,
                activeCertificates,
                pendingApplications,
                upcomingVerifications,
                expiringCertificates,
                expiredCertificates,
            },
            recentCertificates,
            activeApplications,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve dashboard statistics.' });
    }
}
