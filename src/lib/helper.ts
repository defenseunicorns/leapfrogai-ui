import { env } from '$env/dynamic/public';

export function urlConcat(url: string): string {
	return (env.PUBLIC_URL_PREFIX === undefined ? '' : env.PUBLIC_URL_PREFIX) + url;
}

export const minutesElapsed = (start: number, end: number): string => {
	return ((end - start) / 1000 / 60).toFixed(2);
};
