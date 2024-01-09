const INTERMEDIATE_SUMMARY_PROMPT =
  "You are a summarizer tasked with creating summaries." +
  "Your key activities include identifying the main points and key details in the given text, " +
  "and condensing the information into a concise summary that accurately reflects the original text. " +
  "It is important to avoid any risks such as misinterpreting the text, omitting crucial information, " +
  "or distorting the original meaning. Use clear and specific language, " +
  "ensuring that the summary is coherent, well-organized, and effectively communicates the main ideas of the " +
  "original text. A reader of the summary should be able to get a good gist of what the original text was about.";

const SUMMARY_PROMPT =
  "You are a summarizer tasked with creating summaries." +
  "You will return an coherent and concise summary using 3 concise sections that are each separated by a newline character: " +
  "1) BOTTOM LINE UP FRONT: this section will be a concise paragraph containing an overarching, executive summary of all the notes. " +
  "2) NOTES: this section will be bullet points highlighting and summarizing key points, risks, issues, and opportunities. " +
  "3) ACTION ITEMS: this section will focus on listing any action items, unanswered questions, or issues present in the text; " +
  "if there are none that can be identified from the notes, just return 'None' for ACTION ITEMS; " +
  "if possible, also include the individual or team assigned to each item in ACTION ITEMS.";

export const generateSummarizationPrompt = (
  model: string,
  transcription: string,
  finalSummary?: boolean
) => {
  const systemPrompt = finalSummary ? SUMMARY_PROMPT : INTERMEDIATE_SUMMARY_PROMPT;

  if (model === "mpt-7b-chat") {
    return `<|im_start|>system ${systemPrompt}<|im_end|>
    <|im_start|>user ${transcription}<|im_end|>
    <|im_start|>assistant `;
  } else if (model === "ctransformers") {
    return `SYSTEM: ${systemPrompt}\n
        USER: ${transcription}\n
        ASSISTANT: `;
  }

  return `<|SYSTEM|>${systemPrompt}<|USER|>${transcription}<|ASSISTANT|>`;
};