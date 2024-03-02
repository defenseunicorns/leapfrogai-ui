import {env} from "$env/dynamic/public";
import {v4 as uuidv4} from "uuid";
import type {Writable} from "svelte/store";

export function urlConcat(url: string) : string {

    return (env.PUBLIC_URL_PREFIX === undefined ? "" : env.PUBLIC_URL_PREFIX) + url;
}

export function newChat(curConversationId: Writable<string>, conversations: Writable<any[]>): string {
    let chatUuid: string = uuidv4();
    conversations.update((n: Conversation[]) => [
        ...n,
        {id: chatUuid, name: "New conversation", messages: []} as Conversation,
    ]);
    curConversationId.set(chatUuid);
    return chatUuid;
}

export const minutesElapsed = (start: number, end: number): string => {
    return ((end - start) / 1000 / 60).toFixed(2);
  };
