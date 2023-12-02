import type { RequestEvent } from '@sveltejs/kit';
import OpenAI from 'openai';
import {env} from "$env/dynamic/private";

let openai = new OpenAI();

/** @type {import('./$types').RequestHandler} */
export async function GET(event: RequestEvent) {
    // This sets the openai client values at runtime to prevent a compile time dependency on the environment variables
    openai.apiKey = env.OPENAI_API_KEY;
    openai.baseURL = env.OPENAI_API_HOST;

    try {
        // Make a request to OpenAI's model API
        const models = await openai.models.list();

        // Retrieve just the model identifier
        let modelList = models.data.map((m) => m.id)

        let data = JSON.stringify(modelList);

        return new Response(data, {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    } catch (error) {
        console.error(error);

        return new Response('Internal Server Error', {
            status: 500,
        })
    }
}