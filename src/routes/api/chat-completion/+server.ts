import axios from 'axios'
import configs from '../../../configs.json'

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
    try {
        const data = await event.request.json()
        const messages = data["messages"];

        // console.log(data)

        // Make a request to OpenAI's Chat Completion API
        const llmResponse = await axios.post(`${configs.OPENAI_API_HOST}/chat/completions`, {
            model: configs.DEFAULT_MODEL,
            messages: messages,
            temperature: data["temperature"],
            max_tokens: data["max_tokens"],
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${configs.OPENAI_API_KEY}`
            }
        });

        // console.log(llmResponse.data)

        // Send the response from OpenAI back to the client
        return new Response(JSON.stringify(llmResponse.data), {
            headers: {
                'Content-Type': 'application/json' 
            }
        });
    } catch (error) {
        console.error(error);

        return new Response('Internal Server Error', {
            status: 500,
        })
    }
}