import type { Actions, RequestEvent } from "./$types";
import { fail } from "@sveltejs/kit";
import { tmpdir } from "os";
import { toFile } from "openai";
import { writeFile, readFile, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";
import OpenAI from "openai";

import { env } from "$env/dynamic/private";
import { PUBLIC_TRANSCRIPTION_MODEL } from "$env/static/public";
import { batchTranscript, tokenize } from "$lib/tokenizer";
import { generateSummarizationPrompt } from "$lib/prompt";
import { clearTmp } from "$lib/cleanup";

const TEMPORARY_DIRECTORY = tmpdir();
const REQUEST_TIMEOUT = 36000 * 1000 // 10 hours
const MAX_TOKENS = Number(env.MAX_TOKENS);

const createChatCompletion = async (
  openaiClient: OpenAI,
  model: string,
  messages: Message[],
  maxTokens: number
) => {
  const completion = await openaiClient.chat.completions.create({
    messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: model,
    temperature: 0,
    max_tokens: maxTokens,
    stream: false,
  });

  return completion.choices[0].message.content.trim();
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
      `Started new workflow for ${filename} (${audioFile.type}) of size ${audioFile.size / 1000000
      }MB.`
    );

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const audioStream = await toFile(audioBuffer);

    openaiClient.audio.transcriptions
      .create({ model: PUBLIC_TRANSCRIPTION_MODEL, file: audioStream })
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
    if (tokenizedTranscript.length > MAX_TOKENS) {
      console.log(`\tUsing batching method for ${filename}`);
      const transcriptBatches = batchTranscript(tokenizedTranscript, MAX_TOKENS/8);

      for (let i = 0; i < transcriptBatches.length; i++) {
        const chunk = transcriptBatches[i];
        const message: Message[] = [
          { role: "system", content: env.INTERMEDIATE_SUMMARIZATION_PROMPT },
          { role: "user", content: chunk },
        ];
        const text = createChatCompletion(openaiClient, model, message, MAX_TOKENS/16);
        intermediateSummary += text;
      }
    } else {
      intermediateSummary = tokenizedTranscript.join(" ");
    }

    const message: Message[] = [
      { role: "system", content: env.FINAL_SUMMARIZATION_PROMPT },
      { role: "user", content: intermediateSummary },
    ];

    const summary = await createChatCompletion(openaiClient, model, message, MAX_TOKENS);

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
