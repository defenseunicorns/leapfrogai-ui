import type { RequestEvent } from '@sveltejs/kit';
import configs from "../../../../configs.json";

/** @type {import('./$types').RequestHandler} */
export async function GET(event: RequestEvent) {
    try {
        await fetch(`${configs.RAG_API_HOST}/health/`)

        return new Response(JSON.stringify({"enabled": true}), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({"enabled": false}), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
        });
    }
}