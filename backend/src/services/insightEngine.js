const fs = require('fs');
const path = require('path');
const { getProcessedReports } = require('../database/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI, model;
let isMockMode = false;
try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
        throw new Error("No Gemini API key");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
} catch (e) {
    isMockMode = true;
}

function loadGovDataset() {
    try {
        // Try backend/data/ first, then root data/
        let dataPath = path.join(__dirname, '../data/district_budgets.json');
        if (!fs.existsSync(dataPath)) {
            dataPath = path.join(__dirname, '../../data/district_budgets.json');
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Could not load gov dataset, returning empty.", error.message);
        return [];
    }
}

async function generateInsights() {
    const reports = await getProcessedReports(1000);
    const budgets = loadGovDataset();
    
    const budgetMap = {};
    budgets.forEach(b => budgetMap[b.district] = b);

    const districtStats = {};

    reports.forEach(r => {
        const d = r.district || 'Unknown';
        if (!districtStats[d]) {
            districtStats[d] = {
                district: d,
                complaint_count: 0,
                urgency_sum: 0,
                categories: {}
            };
        }
        districtStats[d].complaint_count++;
        districtStats[d].urgency_sum += r.urgency || 1;
        districtStats[d].categories[r.category] = (districtStats[d].categories[r.category] || 0) + 1;
    });

    const hotspots = Object.values(districtStats).map(stat => {
        const avg_urgency = stat.urgency_sum / stat.complaint_count;
        const govData = budgetMap[stat.district] || { budget_allocated_millions: 100, population_density_factor: 5 };
        
        let critical_budget_mismatch = false;
        if (stat.complaint_count > 50 && govData.budget_allocated_millions < 150) {
            critical_budget_mismatch = true;
        }

        const priority_score = (avg_urgency * 20) + (stat.complaint_count * 0.5) + (govData.population_density_factor * 10);

        const top_category = Object.keys(stat.categories).reduce((a, b) => stat.categories[a] > stat.categories[b] ? a : b, 'Unknown');

        return {
            district: stat.district,
            complaint_count: stat.complaint_count,
            avg_urgency: avg_urgency.toFixed(2),
            critical_budget_mismatch,
            priority_score_raw: priority_score,
            gov_budget: govData.budget_allocated_millions,
            top_category
        };
    });

    hotspots.sort((a, b) => b.priority_score_raw - a.priority_score_raw);
    return hotspots;
}

async function generateVertexAIScoring(hotspots) {
    if (isMockMode || hotspots.length === 0) {
        return hotspots.map(h => ({
            ...h,
            ai_priority_score: Math.min(100, Math.floor(h.priority_score_raw)),
            justification: "Critical budget mismatch detected; resources should be prioritized based on urgent citizen volume."
        }));
    }

    const prompt = `
        Act as an urban planning optimization model. Given these infrastructure hotspots with citizen urgency data and budget constraints, assign a Priority Score (1-100) and provide a 1-sentence actionable justification for each district. Return strict JSON array.
        Data: ${JSON.stringify(hotspots)}

        Output exactly a JSON array of objects with keys: "district", "ai_priority_score", "justification".
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        const jsonStr = response.replace(/```json/gi, '').replace(/```/gi, '').trim();
        const parsed = JSON.parse(jsonStr);
        
        return hotspots.map(h => {
            const aiData = parsed.find(p => p.district === h.district) || {};
            return {
                ...h,
                ai_priority_score: aiData.ai_priority_score || Math.floor(h.priority_score_raw),
                justification: aiData.justification || "Needs infrastructural evaluation based on metric volumes."
            };
        });
    } catch (error) {
        console.error("AI scoring failed:", error.message);
        return hotspots.map(h => ({
            ...h,
            ai_priority_score: Math.min(100, Math.floor(h.priority_score_raw)),
            justification: "Calculated via fallback heuristic."
        }));
    }
}

module.exports = {
    loadGovDataset,
    generateInsights,
    generateVertexAIScoring
};
