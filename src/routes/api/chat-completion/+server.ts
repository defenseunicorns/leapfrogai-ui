import OpenAI from 'openai';
import configs from '../../../configs.json';

const openai = new OpenAI({
    apiKey: configs.OPENAI_API_KEY,
    baseURL: configs.OPENAI_API_HOST
  });

/** @type {import('./$types').RequestHandler} */
export async function POST(event) {
    try {
        const data = await event.request.json()
        const messages = data["messages"];

        // console.log(data)

        // Make a request to OpenAI's Chat Completion API
        const chatCompletion = await openai.chat.completions.create({
            messages: messages,
            model: configs.DEFAULT_MODEL,
            temperature: data["temperature"],
            max_tokens: data["max_tokens"]
          });

        // console.log(llmResponse.data)

        // Send the response from OpenAI back to the client
        return new Response(JSON.stringify(chatCompletion), {
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