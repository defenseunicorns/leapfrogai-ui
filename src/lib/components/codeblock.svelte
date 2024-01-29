<script lang="ts">
	import { HighlightAuto } from 'svelte-highlight';
	import github from 'svelte-highlight/styles/github-dark';
	import { FileCopyOutline } from 'flowbite-svelte-icons';

	export let lang: string, text: string;

	function copyToClipboard() {
		navigator.clipboard.writeText(text).catch((err) => {
			console.error('Failed to copy: ', err);
		});
	}
</script>

<svelte:head>
	{@html github}
</svelte:head>

<div class="code-block">
	<div class="flex justify-between bg-accent text-accent-content">
		<span class="language-label ml-2">{lang}</span>
		<button class="copy-button align-middle" on:click={copyToClipboard}>
			<FileCopyOutline ariaLabel="Copy Code" class="align-middle justify-center" size="sm" />
		</button>
	</div>
	<HighlightAuto code={text} />
</div>
