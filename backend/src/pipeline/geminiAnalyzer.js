const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
let model;
let isMockMode = false;

try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
        throw new Error("No Gemini API key");
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "You are an expert infrastructure analyst for BRICS nations. Extract strict JSON data from the citizen report."
    });
} catch (e) {
    console.log("⚠️  Gemini API not configured, using mock AI analyzer.");
    isMockMode = true;
}

async function analyzeReport(translatedText) {
    if (isMockMode) {
        return {
            category: "Roads",
            urgency: 4,
            key_issue: "Potholes blocking traffic",
            sentiment: "Frustrated",
            affected_population_estimate: "High",
            infrastructure_type: "Physical"
        };
    }

    const prompt = `
        Analyze the following citizen infrastructure report.
        Report: "${translatedText}"

        Return strict JSON with exactly these keys and valid values:
        - "category": (Choose one: Roads, Water, Power, Healthcare, Education, Sanitation, Connectivity, Other)
        - "urgency": (Number between 1 and 5, where 5 is highest)
        - "key_issue": (String, max 3 words)
        - "sentiment": (Choose one: Frustrated, Neutral, Desperate, Hopeful)
        - "affected_population_estimate": (Choose one: Low, Medium, High)
        - "infrastructure_type": (Choose one: Physical, Digital, Social)

        Output ONLY valid JSON object with no markdown block wrappers if possible.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        const jsonStr = response.replace(/```json/gi, '').replace(/```/gi, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error analyzing report with Gemini:", error.message);
        return {
            category: "Other",
            urgency: 3,
            key_issue: "Analysis Error",
            sentiment: "Neutral",
            affected_population_estimate: "Medium",
            infrastructure_type: "Physical"
        };
    }
}

module.exports = {
    analyzeReport
};
