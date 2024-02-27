<script lang="ts">
	import "../app.css";
	import ThemeSwitcher from "$lib/components/themeSwitcher.svelte";
	import ApiIndicator from "$lib/components/apiIndicator.svelte";
	import settings from "$lib/settings";
	import { env } from "$env/dynamic/public";
	import { tooltip } from "@svelte-plugins/tooltips";

	const branding: Boolean = env.PUBLIC_AI4NS_BRANDING === "true" ? true : false;
</script>

<style>
	:global(.tooltip.homepage-tooltip) {
    	--tooltip-color: #fff;
	}
</style>

<!-- Title Bar -->
<div
	class="fixed top-0 w-full flex items-center justify-between p-4 border-b border-inherit bg-base-100"
>
	<div class="flex items-center">
		{#if branding}
			<a href="/">				
				<img src="DU_unicorn_rgb.png" alt="AI for National Security" class="h-11" />
			</a>
					<div style="margin-left: 8px;">
			<h1 class="text-xl font-bold">AI for National Security</h1>
		</div>
		{/if}
		{#if !branding}
			<a href="/">
				<img src="leapfrogai.png" alt="LeapfrogAI" class="h-11" />
			</a>
		{/if}
	</div>
	<div class="flex items-center">
		<a href="/chat" use:tooltip={{
			content: "Interact with the Chat, set your persona, and label your conversations. Ask me.... <some sample question>",
			position: "bottom",
			autoPosition: true,
			align: "center",
			animation: "slide",
			action: "hover",
			theme: "homepage-tooltip"
		}}>Chat</a>
		<ApiIndicator type={$settings.chatModel} />
	</div>
	<div class="flex items-center">
		<a href="/upload" use:tooltip={{
			content: "Upload a video or audio file and get a summarization or translation!",
			position: "bottom",
			autoPosition: true,
			align: "center",
			animation: "slide",
			action: "hover",
			theme: "homepage-tooltip"
		}}>Transcribe</a>
		<ApiIndicator type={$settings.transcriptionModel} />
	</div>
	<div>
		<a href="/help">Help</a>
	</div>
	<div class="flex items-center">
		<ThemeSwitcher />
	</div>
</div>

<slot />
