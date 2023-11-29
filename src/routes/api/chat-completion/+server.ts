import OpenAI from 'openai';
import configs from '../../../configs.json';
import type { RequestEvent } from '@sveltejs/kit';
import { Readable } from 'stream';

const openai = new OpenAI({
    apiKey: configs.OPENAI_API_KEY,
    baseURL: configs.OPENAI_API_HOST
});

/** @type {import('./$types').RequestHandler} */
export async function POST(event: RequestEvent) {
    try {
        const data = await event.request.json()
        const messages = data["messages"];

        // console.log(data)

        // Make a request to OpenAI's Chat Completion API
        const chatCompletion = await openai.chat.completions.create({
            messages: messages,
            model: data["model"],
            temperature: data["temperature"],
            max_tokens: data["max_tokens"],
            stream: true
        });

        const body = new ReadableStream({
            async pull(controller) {
                for await (const part of chatCompletion) {
                    const content = part.choices[0]['delta'].content;
                    // console.log(content)
                    controller.enqueue(content || '');
                }
                controller.close();
            }
        });

        return new Response(body, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain'
            },
        });

        // console.log(llmResponse.data)
    } catch (error) {
        console.error(error);

        return new Response('Internal Server Error', {
            status: 500,
        })
    }
}