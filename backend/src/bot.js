const TelegramBot = require('node-telegram-bot-api');
const { downloadTelegramFile, transcribeAudio } = require('./pipeline/audioProcessor');
const { translateToEnglish } = require('./pipeline/translator');
const { analyzeReport } = require('./pipeline/geminiAnalyzer');
const { saveRawReport, saveProcessedReport, getStats } = require('./database/firestore');
const { v4: uuidv4 } = require('uuid');

let bot;

// Simple state management for demo purposes
const userState = {};

function initBot(webhookUrl = null) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token || token === 'your_telegram_bot_token') {
        console.log("⚠️  TELEGRAM_BOT_TOKEN not provided or invalid, bot endpoints will mock/skip execution.");
        return null;
    }

    if (webhookUrl) {
        bot = new TelegramBot(token);
        bot.setWebHook(`${webhookUrl}/webhook`);
        console.log(`Telegram Bot webhook set to ${webhookUrl}/webhook`);
    } else {
        bot = new TelegramBot(token, { polling: true });
        console.log("Telegram Bot started in polling mode.");
    }

    setupBotHandlers();
    return bot;
}

function setupBotHandlers() {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'English', callback_data: 'lang_en-US' }, { text: 'हिंदी (Hindi)', callback_data: 'lang_hi-IN' }],
                    [{ text: 'Русский (Russian)', callback_data: 'lang_ru-RU' }, { text: 'Português', callback_data: 'lang_pt-BR' }],
                    [{ text: 'தமிழ் (Tamil)', callback_data: 'lang_ta-IN' }, { text: 'বাংলা (Bengali)', callback_data: 'lang_bn-IN' }]
                ]
            }
        };
        bot.sendMessage(chatId, "Welcome to the BRICS Infrastructure Reporting Bot. Please select your preferred language:", opts);
    });

    bot.onText(/\/status/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            const stats = await getStats();
            bot.sendMessage(chatId, `📊 Current Infrastructure Reports:\nTotal Reports: ${stats.total_reports}\n\nThank you for keeping our community informed!`);
        } catch (e) {
            bot.sendMessage(chatId, `📊 Current Infrastructure Reports are currently unavailable.`);
        }
    });

    bot.on('callback_query', (callbackQuery) => {
        const msg = callbackQuery.message;
        const data = callbackQuery.data;
        const chatId = msg.chat.id;

        if (data.startsWith('lang_')) {
            const lang = data.split('_')[1];
            userState[chatId] = { language: lang, step: 'awaiting_report' };
            bot.sendMessage(chatId, "Language selected. Please send your infrastructure report via text or voice message.");
            bot.answerCallbackQuery(callbackQuery.id);
        }
    });

    bot.on('message', async (msg) => {
        if (msg.text && (msg.text.startsWith('/') || msg.text === '/status')) return; // Ignore commands
        
        const chatId = msg.chat.id;
        const state = userState[chatId] || { language: 'en-US', step: 'awaiting_report' };
        userState[chatId] = state;

        if (state.step === 'awaiting_pincode') {
            state.pincode = msg.text;
            state.step = 'awaiting_report'; // Reset state
            
            const reportData = state.pendingReport;
            reportData.pincode = state.pincode;
            
            await saveProcessedReport(reportData);
            bot.sendMessage(chatId, `✅ Thank you! Your report has been submitted.\nReport ID: ${reportData.report_id}\n\nOur systems will analyze this and alert authorities.`);
            delete state.pendingReport;
            return;
        }

        if (state.step === 'awaiting_report') {
            try {
                bot.sendMessage(chatId, "Processing your report...");
                
                let originalText = '';
                let isVoice = false;

                if (msg.voice) {
                    isVoice = true;
                    const audioBuffer = await downloadTelegramFile(msg.voice.file_id, process.env.TELEGRAM_BOT_TOKEN);
                    originalText = await transcribeAudio(audioBuffer, state.language);
                } else if (msg.text) {
                    originalText = msg.text;
                } else {
                    return bot.sendMessage(chatId, "Please send a text or voice message.");
                }

                // Save raw
                const rawReport = {
                    chat_id: chatId,
                    original_text: originalText,
                    language: state.language,
                    timestamp: new Date().toISOString(),
                    is_voice: isVoice
                };
                await saveRawReport(rawReport);

                // Pipeline
                const { translatedText } = await translateToEnglish(originalText, state.language);
                const analysis = await analyzeReport(translatedText);

                // Prepare processed report
                const reportId = uuidv4();
                state.pendingReport = {
                    report_id: reportId,
                    chat_id: chatId,
                    original_text: originalText,
                    translated_text: translatedText,
                    language: state.language,
                    ...analysis,
                    timestamp: rawReport.timestamp,
                    status: 'Pending'
                };

                state.step = 'awaiting_pincode';
                bot.sendMessage(chatId, "Report understood. Please enter your Pincode / Postal Code to accurately map this issue:");

            } catch (error) {
                console.error("Error processing message:", error);
                bot.sendMessage(chatId, "Sorry, there was an error processing your report. Please try again later.");
            }
        }
    });
}

function processUpdate(update) {
    if (bot) bot.processUpdate(update);
}

module.exports = {
    initBot,
    processUpdate
};
