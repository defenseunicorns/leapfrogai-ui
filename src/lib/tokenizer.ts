import natural from "natural";

// takes in a string and estimate the number of tokens using a library or algorithm of choice
export const tokenize = (text: string): string[] => {
  const tokenizer = new natural.WordTokenizer();
  const tokenizedArr = tokenizer.tokenize(text);

  if (!tokenizedArr || tokenizedArr.length === 0) {
    throw new Error("Tokenization failed: input string was empty or contained invalid tokens.");
  }

  return tokenizedArr;
};

// takes in a transcript and returns an array with chunks of the transcript based on token estimation
export const batchTranscript = (tokenizedTranscript: string[], maxBatchSize: number): string[] => {
  const batches: string[] = [];
  const tokenizedTranscriptLength = tokenizedTranscript.length;

  for (let i = 0; i < tokenizedTranscriptLength; i += maxBatchSize) {
    let end = i + maxBatchSize;
    if (tokenizedTranscriptLength < end) {
      end = tokenizedTranscriptLength;
    }
    const batchTokens = tokenizedTranscript.slice(i, i + maxBatchSize);
    const batch = batchTokens.join(" ");
    batches.push(batch);
  }

  return batches;
};
