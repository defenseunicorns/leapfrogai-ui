const express = require('express');
const axios = require('axios');
const configs = require('../src/configs.json')
var cors = require('cors')

const app = express();
app.use(cors())
app.use(express.json());

const port = 3001;

app.post('/chat-completion', async (req, res) => {
    try {
        // Hardcoded chat input
        const messages = req.body["messages"];

        // Make a request to OpenAI's Chat Completion API
        const response = await axios.post(`${configs.OPENAI_API_HOST}/chat/completions`, {
            model: configs.DEFAULT_MODEL,
            messages: messages,
            temperature: req.body["temperature"],
            max_tokens: req.body["max_tokens"],
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${configs.OPENAI_API_KEY}`
            }
        });

        // Send the response from OpenAI back to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${port}`);
});

