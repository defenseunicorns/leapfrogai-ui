import type { Actions, RequestEvent } from "./$types";
import { fail } from "@sveltejs/kit";
import { tmpdir } from "os";
import { toFile } from "openai";
import { writeFile, readFile, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import path from "node:path";

import { completion, openai } from "$lib/openai";
import { env } from "$env/dynamic/private";
import { batchTranscript, tokenize } from "$lib/tokenizer";
import { generateSummarizationPrompt } from "$lib/prompt";
import { clearTmp } from "$lib/cleanup";

const TEMPORARY_DIRECTORY = tmpdir();

export const actions = {
  upload: async ({ request }: RequestEvent) => {
    clearTmp(TEMPORARY_DIRECTORY);

    const formData = await request.formData();

    const audioFile = formData.get("audioUpload") as File;

    if (!audioFile) {
      return fail(400, {
        error: true,
        message: "You must provide a file to upload"
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

    openai.audio.transcriptions
      .create({ model: "leapfrogai-transcribe", file: audioStream })
      .then(async (res) => {
        console.log(`\tSuccessfully transcribed ${filename}`);

        const transcriptionResult = res.text;

        await writeFile(`${TEMPORARY_DIRECTORY}/${uid}.txt`, transcriptionResult);

        return transcriptionResult;
      })
      .catch((error) => {
        return fail(400, {
          error: true,
          message: error.message.toString()
        });
      });

    return {
      upload: {
        filename: filename,
        name: path.parse(audioFile.name).name,
        uid: uid,
        success: true
      }
    };
  },

  summarize: async ({ request }: RequestEvent) => {
    const formData = await request.formData();

    const uid = formData.get("uid") as File;
    const filename = formData.get("filename") as File;
    const transcriptionFile = path.join(TEMPORARY_DIRECTORY, `${uid}.txt`);
    const transcription = await readFile(transcriptionFile, "utf8");

    const tokenizedTranscript = tokenize(transcription as string);

    const model = env.SUMMARIZATION_MODEL || "leapfrogai-language";

    // batching method only occurs at high token counts
    let intermediateSummary = "";
    if (tokenizedTranscript.length > 7500) {
      console.log(`\tUsing batching method for ${filename}`);
      const transcriptBatches = batchTranscript(tokenizedTranscript, 1500);

      for (let i = 0; i < transcriptBatches.length; i++) {
        const chunk = transcriptBatches[i];
        const prompt = generateSummarizationPrompt(model, chunk);
        const text = await completion(model, prompt, 500);
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
    const summary = await completion(model, prompt, 7500);

    await unlink(transcriptionFile);
    console.log(`\tSuccessfully summarized ${filename}`);

    return {
      upload: {
        transcription: transcription,
        filename: filename,
        uid: uid,
        success: true
      },
      summarize: {
        summary,
        success: true
      }
    };
  }
} satisfies Actions;