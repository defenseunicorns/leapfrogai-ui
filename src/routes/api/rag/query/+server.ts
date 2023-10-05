import type { RequestEvent } from '@sveltejs/kit';
import configs from "../../../../configs.json";

/** @type {import('./$types').RequestEvent} */
export async function POST(event: RequestEvent) {
    try {
        const data = await event.request.json();

        const result = await fetch(`${configs.RAG_API_HOST}/query/`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Retrieve the query results directly from the json object
        const context = await result.json().then((json) => json['results']);

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