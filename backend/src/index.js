require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initBot, processUpdate } = require('./bot');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS enabled
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Setup Telegram Bot
const webhookUrl = process.env.WEBHOOK_URL;
initBot(webhookUrl);

// POST /webhook (Telegram webhook) - useful for ngrok testing
app.post('/webhook', (req, res) => {
    processUpdate(req.body);
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send('BRICS Infrastructure AI Backend is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    if (!webhookUrl) {
        console.log('Bot is running in polling mode. To use webhooks, set WEBHOOK_URL in .env (e.g., via ngrok).');
    }
});
