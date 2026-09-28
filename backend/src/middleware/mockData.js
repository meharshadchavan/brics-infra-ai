// Generates 500+ mock reports dynamically for demo with realistic distribution
const { v4: uuidv4 } = require('uuid');

const districts = [
    'Pune Central', 'Mumbai North', 'Delhi South', 'Chennai East', 'Kolkata West',
    'Bengaluru Central', 'Hyderabad North', 'Ahmedabad East', 'Jaipur Central', 'Lucknow West'
];

const languages = ['hi-IN', 'ta-IN', 'bn-IN', 'en-US', 'te-IN', 'ru-RU', 'pt-BR'];

// District weights - some districts get MANY more complaints to trigger hotspot detection
const districtWeights = {
    'Pune Central':       { weight: 18, budgetPressure: true },   // ~90 complaints
    'Lucknow West':       { weight: 16, budgetPressure: true },   // ~80 complaints  
    'Jaipur Central':     { weight: 14, budgetPressure: true },   // ~70 complaints
    'Kolkata West':       { weight: 13, budgetPressure: true },   // ~65 complaints
    'Mumbai North':       { weight: 8,  budgetPressure: false },  // ~40 complaints
    'Delhi South':        { weight: 8,  budgetPressure: false },  // ~40 complaints
    'Chennai East':       { weight: 7,  budgetPressure: false },  // ~35 complaints
    'Bengaluru Central':  { weight: 6,  budgetPressure: false },  // ~30 complaints
    'Hyderabad North':    { weight: 5,  budgetPressure: false },  // ~25 complaints
    'Ahmedabad East':     { weight: 5,  budgetPressure: false },  // ~25 complaints
};

const categoriesWithWeights = [
    { cat: 'Roads',       weight: 38 },
    { cat: 'Water',       weight: 25 },
    { cat: 'Power',       weight: 18 },
    { cat: 'Healthcare',  weight: 11 },
    { cat: 'Education',   weight: 8  },
];

// Rich multilingual original texts
const originalTexts = {
    'Roads': {
        'hi-IN': ['सड़क पर बहुत बड़ा गड्ढा है', 'सड़क टूटी हुई है और दुर्घटनाएं हो रही हैं', 'पुल की मरम्मत जरूरी है'],
        'ta-IN': ['சாலையில் பெரிய குழி உள்ளது', 'சாலை மோசமான நிலையில் உள்ளது', 'பாலம் பழுதடைந்துள்ளது'],
        'bn-IN': ['রাস্তায় বড় গর্ত আছে', 'রাস্তার অবস্থা খুব খারাপ', 'সেতু মেরামত দরকার'],
        'en-US': ['Large pothole causing accidents daily', 'Road completely broken near school', 'Bridge needs urgent repair'],
        'te-IN': ['రోడ్డులో పెద్ద గుంత ఉంది', 'రోడ్డు చాలా పాడైపోయింది'],
        'ru-RU': ['На дороге большая яма', 'Дорога разрушена, нужен ремонт'],
        'pt-BR': ['Há um buraco enorme na estrada', 'A estrada está completamente danificada'],
    },
    'Water': {
        'hi-IN': ['पानी की आपूर्ति तीन दिनों से बंद है', 'पानी दूषित आ रहा है', 'नल में पानी नहीं आता'],
        'ta-IN': ['மூன்று நாட்களாக தண்ணீர் வரவில்லை', 'தண்ணீர் அசுத்தமாக உள்ளது'],
        'bn-IN': ['তিন দিন ধরে পানি নেই', 'পানি দূষিত হয়ে গেছে'],
        'en-US': ['No water supply for 3 days', 'Contaminated water coming from taps', 'Water pipe burst on main street'],
        'te-IN': ['మూడు రోజులుగా నీళ్ళు రావడం లేదు', 'నీళ్ళు కలుషితంగా వస్తున్నాయి'],
        'ru-RU': ['Три дня нет воды', 'Вода загрязнена'],
        'pt-BR': ['Sem água há três dias', 'Água contaminada saindo das torneiras'],
    },
    'Power': {
        'hi-IN': ['बिजली 12 घंटे से नहीं है', 'ट्रांसफार्मर जल गया है', 'बिजली की लाइन टूट गई है'],
        'ta-IN': ['12 மணி நேரமாக மின்சாரம் இல்லை', 'டிரான்ஸ்பார்மர் எரிந்துவிட்டது'],
        'bn-IN': ['১২ ঘণ্টা ধরে বিদ্যুৎ নেই', 'ট্রান্সফর্মার পুড়ে গেছে'],
        'en-US': ['No electricity for 12 hours', 'Transformer burned out', 'Power lines down after storm'],
        'te-IN': ['12 గంటలుగా విద్యుత్ లేదు', 'ట్రాన్స్ఫార్మర్ కాలిపోయింది'],
        'ru-RU': ['12 часов без электричества', 'Трансформатор сгорел'],
        'pt-BR': ['12 horas sem eletricidade', 'Transformador queimou'],
    },
    'Healthcare': {
        'hi-IN': ['सरकारी अस्पताल में दवाएं नहीं हैं', 'डॉक्टर नहीं मिल रहे', 'अस्पताल बंद पड़ा है'],
        'ta-IN': ['அரசு மருத்துவமனையில் மருந்து இல்லை', 'மருத்துவர் கிடைக்கவில்லை'],
        'bn-IN': ['সরকারি হাসপাতালে ওষুধ নেই', 'ডাক্তার পাওয়া যাচ্ছে না'],
        'en-US': ['No medicines in government hospital', 'Doctor shortage at primary health center', 'Hospital equipment broken'],
        'te-IN': ['ప్రభుత్వ ఆసుపత్రిలో మందులు లేవు', 'డాక్టర్లు అందుబాటులో లేరు'],
        'ru-RU': ['В больнице нет лекарств', 'Нехватка врачей'],
        'pt-BR': ['Sem medicamentos no hospital público', 'Falta de médicos no posto de saúde'],
    },
    'Education': {
        'hi-IN': ['स्कूल की छत टूट रही है', 'शिक्षक नहीं हैं विद्यालय में', 'शौचालय की सुविधा नहीं है'],
        'ta-IN': ['பள்ளி கட்டிடம் இடிந்து விழுகிறது', 'ஆசிரியர்கள் இல்லை'],
        'bn-IN': ['স্কুলের ছাদ ভেঙে পড়ছে', 'শিক্ষক নেই বিদ্যালয়ে'],
        'en-US': ['School roof collapsing', 'No teachers for 2 weeks', 'School has no toilets'],
        'te-IN': ['పాఠశాల భవనం కూలిపోతోంది', 'ఉపాధ్యాయులు లేరు'],
        'ru-RU': ['Крыша школы рушится', 'Нет учителей'],
        'pt-BR': ['Teto da escola desabando', 'Sem professores há semanas'],
    },
};

const translatedTexts = {
    'Roads': [
        'There is a very large pothole on the road causing daily accidents',
        'The road is completely broken and dangerous near the school',
        'The bridge needs urgent repair before monsoon season',
        'Main road flooded due to broken drainage, traffic blocked',
        'Speed breakers missing on highway causing fatal accidents',
    ],
    'Water': [
        'No water supply for the past 3 days in the entire locality',
        'Contaminated brownish water coming from taps, causing illness',
        'Water pipe has burst on the main street, flooding the area',
        'Water tanker has not arrived for 5 days, acute shortage',
        'Sewage mixing with drinking water in our colony',
    ],
    'Power': [
        'No electricity for 12 hours, food spoiling, medical equipment affected',
        'Transformer has burned out, entire area in darkness',
        'Power lines are down after last night\'s storm',
        'Frequent power cuts every day lasting 6-8 hours',
        'Electric poles dangerously leaning over road after flood',
    ],
    'Healthcare': [
        'Government hospital has no medicines, patients turned away',
        'No doctor available at primary health center since 2 weeks',
        'Hospital equipment is broken, X-ray machine non-functional',
        'Ambulance not available, patient died waiting for transport',
        'No clean drinking water or sanitation at community health center',
    ],
    'Education': [
        'School roof is collapsing, children studying in dangerous conditions',
        'No teachers for 2 weeks, children sitting idle',
        'School has no functional toilets, girls dropping out',
        'School building has not been repaired in 10 years',
        'Midday meal scheme stopped, children going hungry',
    ],
};

function getRandomCategory() {
    const rand = Math.random() * 100;
    let sum = 0;
    for (const c of categoriesWithWeights) {
        sum += c.weight;
        if (rand <= sum) return c.cat;
    }
    return 'Roads';
}

function getRandomDistrict() {
    const totalWeight = Object.values(districtWeights).reduce((s, d) => s + d.weight, 0);
    const rand = Math.random() * totalWeight;
    let sum = 0;
    for (const [name, d] of Object.entries(districtWeights)) {
        sum += d.weight;
        if (rand <= sum) return name;
    }
    return 'Pune Central';
}

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const mockProcessedReports = [];

// Generate 500 reports with weighted district distribution
for (let i = 0; i < 500; i++) {
    const category = getRandomCategory();
    const district = getRandomDistrict();
    const language = getRandomItem(languages);
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString();

    // High-pressure districts get higher urgency on average
    const distInfo = districtWeights[district];
    const urgencyBase = distInfo.budgetPressure ? 2 : 1;
    const urgency = Math.min(5, urgencyBase + Math.floor(Math.random() * 4));

    const langTexts = originalTexts[category][language] || originalTexts[category]['en-US'];
    const originalText = getRandomItem(langTexts);
    const translatedText = getRandomItem(translatedTexts[category]);

    const pincodeMap = {
        'Pune Central': '411001', 'Mumbai North': '400001', 'Delhi South': '110001',
        'Chennai East': '600001', 'Kolkata West': '700001', 'Bengaluru Central': '560001',
        'Hyderabad North': '500001', 'Ahmedabad East': '380001', 'Jaipur Central': '302001',
        'Lucknow West': '226001'
    };

    mockProcessedReports.push({
        report_id: `req_${String(i + 1).padStart(5, '0')}`,
        timestamp,
        original_input_type: Math.random() > 0.4 ? 'text' : 'voice',
        source_language_detected: language,
        original_text: originalText,
        translated_english_text: translatedText,
        user_id: `telegram_user_${Math.floor(Math.random() * 90000) + 10000}`,
        pincode: pincodeMap[district] || '400000',
        district,
        gemini_analysis: {
            category,
            urgency,
            key_issue: `${category.toLowerCase()} issue`,
            sentiment: urgency >= 4 ? 'Desperate' : urgency >= 3 ? 'Frustrated' : 'Neutral',
            affected_population_estimate: urgency >= 4 ? 'High' : urgency >= 3 ? 'Medium' : 'Low',
            infrastructure_type: category === 'Education' || category === 'Healthcare' ? 'Social' : 'Physical',
        },
        // Flat fields for easy aggregation
        category,
        urgency,
        key_issue: `${category.toLowerCase()} issue`,
        sentiment: urgency >= 4 ? 'Desperate' : urgency >= 3 ? 'Frustrated' : 'Neutral',
        language,
        status: 'processed',
    });
}

module.exports = {
    mockProcessedReports,
    districts,
};
