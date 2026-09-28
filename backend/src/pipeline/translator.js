const { Translate } = require('@google-cloud/translate').v2;

let translateClient;
let isMockMode = false;

try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS === './service-account.json') {
        throw new Error("No real GCP credentials");
    }
    translateClient = new Translate();
} catch (e) {
    console.log("⚠️  Google Cloud Translation not configured, using mock translation.");
    isMockMode = true;
}

async function translateToEnglish(text, sourceLanguageHint = null) {
    if (!text) return { translatedText: '', detectedSourceLanguage: 'en' };
    
    // If it's explicitly set as English, bypass translate API
    if (sourceLanguageHint && sourceLanguageHint.startsWith('en')) {
        return { translatedText: text, detectedSourceLanguage: 'en' };
    }
    
    if (isMockMode) {
        return {
            translatedText: text + " (Mock Translated to English)",
            detectedSourceLanguage: sourceLanguageHint || 'hi-IN'
        };
    }

    try {
        const options = {
            to: 'en'
        };
        
        if (sourceLanguageHint) {
            options.from = sourceLanguageHint.split('-')[0];
        }

        let [translations, apiResponse] = await translateClient.translate(text, options);
        translations = Array.isArray(translations) ? translations : [translations];
        
        let detectedLanguage = options.from;
        if (!detectedLanguage && apiResponse && apiResponse.data && apiResponse.data.translations) {
            detectedLanguage = apiResponse.data.translations[0].detectedSourceLanguage;
        }

        return {
            translatedText: translations[0],
            detectedSourceLanguage: detectedLanguage || 'unknown'
        };
    } catch (error) {
        console.error("Error translating text:", error.message);
        throw error;
    }
}

module.exports = {
    translateToEnglish
};
