interface chatModel extends model {
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    frequency_penalty: number;
    presence_penalty: number;
}