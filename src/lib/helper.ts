import {env} from "$env/dynamic/public";

export function urlConcat(url: string) : string {
    const concatUrl = "/location" + url;
    console.log('Now going to ' + concatUrl)
    return concatUrl;
}