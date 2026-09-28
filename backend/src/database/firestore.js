const admin = require('firebase-admin');
const { mockProcessedReports } = require('../middleware/mockData');
const { v4: uuidv4 } = require('uuid');

let isMockMode = false;
let db;

try {
    if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'your_firebase_project_id') {
        throw new Error('Firebase credentials not set.');
    }
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.FIREBASE_PROJECT_ID
    });
    db = admin.firestore();
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.log(`⚠️  Firebase not configured: ${error.message}`);
    console.log("⚠️  Running in MOCK DATA mode with rich dataset.");
    isMockMode = true;
}

const localRawReports = [];
const localProcessedReports = [...mockProcessedReports];

async function saveRawReport(reportData) {
    const id = reportData.report_id || uuidv4();
    reportData.report_id = id;
    if (isMockMode) {
        localRawReports.push(reportData);
        return id;
    }
    await db.collection('raw_reports').doc(id).set(reportData);
    return id;
}

async function saveProcessedReport(reportData) {
    const id = reportData.report_id || uuidv4();
    reportData.report_id = id;
    if (isMockMode) {
        localProcessedReports.push(reportData);
        return id;
    }
    await db.collection('processed_reports').doc(id).set(reportData);
    return id;
}

async function getProcessedReports(limit = 100) {
    if (isMockMode) {
        return localProcessedReports.slice(0, limit);
    }
    const snapshot = await db.collection('processed_reports').limit(limit).get();
    return snapshot.docs.map(doc => doc.data());
}

async function getReportsByRegion() {
    const reports = await getProcessedReports(1000);
    const byRegion = {};
    reports.forEach(r => {
        const key = r.pincode || r.district || 'Unknown';
        if (!byRegion[key]) byRegion[key] = [];
        byRegion[key].push(r);
    });
    return byRegion;
}

async function getStats() {
    const reports = await getProcessedReports(1000);
    const stats = {
        total_reports: reports.length,
        category_breakdown: {},
        urgency_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    reports.forEach(r => {
        stats.category_breakdown[r.category] = (stats.category_breakdown[r.category] || 0) + 1;
        if (stats.urgency_distribution[r.urgency] !== undefined) {
            stats.urgency_distribution[r.urgency]++;
        }
    });

    return stats;
}

module.exports = {
    saveRawReport,
    saveProcessedReport,
    getProcessedReports,
    getReportsByRegion,
    getStats,
    isMockMode
};
