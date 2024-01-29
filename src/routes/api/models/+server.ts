import type { RequestEvent } from '@sveltejs/kit';
import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET(event: RequestEvent) {
	const openai = new OpenAI({
		apiKey: env.OPENAI_API_KEY,
		baseURL: env.OPENAI_API_HOST
	});

	try {
		// Make a request to OpenAI's model API
		const models = await openai.models.list();

		// Retrieve just the model identifier
		let modelList = models.data.map((m) => m.id);

		let data = JSON.stringify(modelList);

		return new Response(data, {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		console.error(error);

		return new Response('Internal Server Error', {
			status: 500
		});
	}
}
