import { writable } from 'svelte/store';

export type ModelSettings = {
    chatModel: string,
    transcriptionModel: string
}

export default writable({
    chatModel: " ",
    transcriptionModel: " "
} as ModelSettings);