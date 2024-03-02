import OpenAI from 'openai';
import type { RequestEvent } from '@sveltejs/kit';
import {env} from "$env/dynamic/private";
import {FileLock} from "$lib/interfaces/file_lock";

/** @type {import('./$types').RequestHandler} */
export async function POST(event: RequestEvent) {
    const mutex: FileLock = new FileLock(env.CONCURRENT_REQUESTS);

    const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
        baseURL: env.OPENAI_API_HOST
    });

    try {
        const data: ChatRequest = await event.request.json()
        await mutex.lock();
        const messages = data["messages"];

        // Make a request to OpenAI's Chat Completion API
        const chatCompletion = await openai.chat.completions.create({
            messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
            model: data["model"],
            temperature: data["temperature"],
            max_tokens: data["max_tokens"],
            stream: true
        });

        const body = new ReadableStream({
            async pull(controller) {
                let count: number = 0, lastCount = 0;
                const interval = setInterval(() => {
                    if (count > lastCount) {
                        lastCount = count;
                    } else {
                        mutex.unlock()
                        clearInterval(interval);
                    }

                }, 1000);

                for await (const part of chatCompletion) {
                    const content = part.choices[0]['delta'].content;
                    controller.enqueue(content || '');
                    count++;
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

    } catch (error) {
        console.error(error);
        mutex.unlock()

        return new Response('Internal Server Error', {
            status: 500,
        })
    }
}
