interface ChatRequest {
    key: string
    messages: Message[]
    model: string
    max_tokens: number
    temperature: number
}
