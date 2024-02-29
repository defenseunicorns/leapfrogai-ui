import { env } from '$env/dynamic/private'
import type { RequestEvent } from '@sveltejs/kit'

/** @type {import('./$types').RequestEvent} */
export async function POST(event: RequestEvent) {
    try {
        const data = await event.request.formData()

        const response = await fetch(`${env.RAG_API_HOST}/upload/`, {
            method: 'POST',
            body: data
        })

        if (response.ok) {
            return new Response(null, {
                status: 200
            })
        } else if (response.status === 404) {
            return new Response('Not Found', {
                status: 404
            })
        } else {
            return new Response('Internal Server Error!', {
                status: 500
            })
        }
    } catch (error) {
        return new Response('Internal Server Error!', {
            status: 500
        })
    }
}
