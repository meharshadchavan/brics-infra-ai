const express = require('express');
const { getProcessedReports, getStats } = require('../database/firestore');
const { generateInsights, generateVertexAIScoring, loadGovDataset } = require('../services/insightEngine');
const { translateToEnglish } = require('../pipeline/translator');
const { analyzeReport } = require('../pipeline/geminiAnalyzer');

const router = express.Router();

router.get('/insights', async (req, res) => {
    try {
        const hotspots = await generateInsights();
        const scoredHotspots = await generateVertexAIScoring(hotspots);
        res.json({ success: true, data: scoredHotspots });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/reports', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const reports = await getProcessedReports(limit);
        res.json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = await getStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/gov-data', (req, res) => {
    try {
        const data = loadGovDataset();
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/simulate', async (req, res) => {
    try {
        const { text, language, pincode } = req.body;
        if (!text || !language) return res.status(400).json({ error: "Missing text or language" });

        const { translatedText } = await translateToEnglish(text, language);
        const analysis = await analyzeReport(translatedText);
        
        const result = {
            original_text: text,
            translated_text: translatedText,
            language,
            pincode: pincode || "000000",
            ...analysis,
            timestamp: new Date().toISOString(),
            status: "Simulated"
        };
        
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
