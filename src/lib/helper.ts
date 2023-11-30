import {env} from "$env/dynamic/public";

export function urlConcat(url: string) : string {
    return "/chat" + url;
}