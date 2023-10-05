import type { RequestEvent } from '@sveltejs/kit';
import configs from "../../../../configs.json";

/** @type {import('./$types').RequestEvent} */
export async function POST(event: RequestEvent) {
    try {
        const data = await event.request.formData()

        await fetch(`${configs.RAG_API_HOST}/upload/`, {
            method: "POST",
            body: data,
        })

        return new Response(null, {
            status: 200,
        });
    } catch (error) {
        return new Response("Internal Server Error!", {
            status: 500,
        });
    }
}