import { env } from "$env/dynamic/private";

export const generateSummarizationPrompt = (
  model: string,
  transcription: string,
  finalSummary?: boolean
) => {
  const systemPrompt = finalSummary
    ? env.FINAL_SUMMARIZATION_PROMPT
    : env.INTERMEDIATE_SUMMARY_PROMPT;

  if (model === "mpt-7b-chat") {
    return `<|im_start|>system ${systemPrompt}<|im_end|>
    <|im_start|>user ${transcription}<|im_end|>
    <|im_start|>assistant `;
  }
  return `SYSTEM: ${systemPrompt}\n
        USER: ${transcription}\n
        ASSISTANT: `;
};
