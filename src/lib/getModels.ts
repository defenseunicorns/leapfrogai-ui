import { urlConcat } from "$lib/helper";

export async function getModels() {
    const response = await fetch(urlConcat("/api/models"));
    const models = await response.json();
    return models;
}