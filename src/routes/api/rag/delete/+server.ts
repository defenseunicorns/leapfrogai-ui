import type { RequestEvent } from '@sveltejs/kit';
import {env} from "$env/dynamic/private";

/** @type {import('./$types').RequestEvent} */
export async function POST(event: RequestEvent) {
    try {
        const data = await event.request.json();

        if (data["input"]) {
            const result = await fetch(`${env.RAG_API_HOST}/delete/?doc_ids=` + data["input"], {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }

        return new Response(null, {
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