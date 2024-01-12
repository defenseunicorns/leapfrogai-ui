import type { Actions, RequestEvent } from "./$types";
import { fail } from "@sveltejs/kit";
import { tmpdir } from "os";
import { toFile } from "openai";
import { writeFile, readFile, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import OpenAI from "openai";

import { env } from "$env/dynamic/private";
import { batchTranscript, tokenize } from "$lib/tokenizer";
import { generateSummarizationPrompt } from "$lib/prompt";
import { clearTmp } from "$lib/cleanup";

const TEMPORARY_DIRECTORY = tmpdir();
const REQUEST_TIMEOUT = 36000 * 1000 // 10 hours

const createCompletion = async (
  openaiClient: OpenAI,
  model: string,
  prompt: string,
  maxTokens: number
) => {
  const completion = await openaiClient.completions.create({
    model: model,
    max_tokens: maxTokens,
    temperature: 0.1,
    frequency_penalty: 0.5,
    presence_penalty: 0.0,
    prompt,
  });
  return completion.choices[0].text.trim();
};

export const actions = {
  upload: async ({ request }: RequestEvent) => {
    const openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_API_HOST,
      timeout: REQUEST_TIMEOUT,
    });

    clearTmp(TEMPORARY_DIRECTORY);

    const formData = await request.formData();

    const audioFile = formData.get("audioUpload") as File;

    if (!audioFile) {
      return fail(400, {
        error: true,
        message: "You must provide a file to upload",
      });
    }

    const filename = audioFile.name;
    const uid = uuidv4();

    console.log(
      `Started new workflow for ${filename} (${audioFile.type}) of size ${
        audioFile.size / 1000000
      }MB.`
    );

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioStream = await toFile(audioBuffer);

    openaiClient.audio.transcriptions
      .create({ model: env.TRANSCRIPTION_MODEL, file: audioStream })
      .then(async (res) => {
        console.log(`\tSuccessfully transcribed ${filename}`);

        const transcriptionResult = res.text;

        await writeFile(
          `${TEMPORARY_DIRECTORY}/${uid}.txt`,
          transcriptionResult
        );

        return transcriptionResult;
      })
      .catch((error) => {
        return fail(400, {
          error: true,
          message: error.message.toString(),
        });
      });

    return {
      upload: {
        filename: filename,
        name: path.parse(audioFile.name).name,
        uid: uid,
        success: true,
      },
    };
  },

  summarize: async ({ request }: RequestEvent) => {
    const openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_API_HOST,
      timeout: REQUEST_TIMEOUT,
    });

    const formData = await request.formData();

    const uid = formData.get("uid") as File;
    const filename = formData.get("filename") as File;
    const transcriptionFile = path.join(TEMPORARY_DIRECTORY, `${uid}.txt`);
    const transcription = await readFile(transcriptionFile, "utf8");

    const tokenizedTranscript = tokenize(transcription as string);

    const model = env.SUMMARIZATION_MODEL;

    // batching method only occurs at high token counts
    let intermediateSummary = "";
    if (tokenizedTranscript.length > 7500) {
      console.log(`\tUsing batching method for ${filename}`);
      const transcriptBatches = batchTranscript(tokenizedTranscript, 1500);

      for (let i = 0; i < transcriptBatches.length; i++) {
        const chunk = transcriptBatches[i];
        const prompt = generateSummarizationPrompt(model, chunk);
        const text = createCompletion(openaiClient, model, prompt, 500);
        intermediateSummary += text;
      }
    } else {
      intermediateSummary = tokenizedTranscript.join(" ");
    }

    const prompt = generateSummarizationPrompt(
      model,
      intermediateSummary,
      true // finalSummary
    );

    const summary = await createCompletion(openaiClient, model, prompt, 8192);;

    await unlink(transcriptionFile);
    console.log(`\tSuccessfully summarized ${filename}`);

    return {
      upload: {
        transcription: transcription,
        filename: filename,
        uid: uid,
        success: true,
      },
      summarize: {
        summary,
        success: true,
      },
    };
  },
} satisfies Actions;
