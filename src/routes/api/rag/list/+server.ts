import type { RequestEvent } from '@sveltejs/kit';
import {env} from "$env/dynamic/private";

/** @type {import('./$types').RequestEvent} */
export async function GET(event: RequestEvent) {
    try {
        const result = await fetch(`${env.RAG_API_HOST}/rag/list/`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Retrieve the query results directly from the json object
        const context = await result.text();

        return new Response(context, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        return new Response("Internal Server Error!", {
            status: 500,
        });
    }
}