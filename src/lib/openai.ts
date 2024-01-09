import OpenAI from "openai";
import { env } from "$env/dynamic/private";

export const openai = new OpenAI({
  apiKey: "empty",
  baseURL: env.LEAPFROGAI_BASE_URL,
  timeout: 36000 * 1000
});

export const completion = async (model: string, prompt: string, length: number) => {
  const completion = await openai.completions.create({
    model: model,
    max_tokens: length,
    temperature: 0.5,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    prompt
  });

  return completion.choices[0].text.trim();
};