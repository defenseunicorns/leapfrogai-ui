<script lang="ts">
	import { urlConcat } from '$lib/helper';
	import { Indicator } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	export let type = 'Chat';
	let apiReady = false;

	onMount(async () => {
		apiReady = await getModels();
	});

	async function getModels() {
		const response = await fetch(urlConcat('/api/models'));
		const models = await response.json();
		return models.some((model: string) => model.toLowerCase().includes(type.toLowerCase()));
	}
</script>

<span class="flex items-center ml-2">
	<Indicator color={apiReady ? 'green' : 'red'} size="sm" />
</span>
