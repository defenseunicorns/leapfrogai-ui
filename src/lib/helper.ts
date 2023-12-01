import {env} from "$env/dynamic/public";

export function urlConcat(url: string) : string {

    return (env.PUBLIC_URL_PREFIX === undefined ? "" : env.PUBLIC_URL_PREFIX) + url;
}