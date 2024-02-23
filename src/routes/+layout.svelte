<script lang="ts">
	import "../app.css";
	import ThemeSwitcher from "$lib/components/themeSwitcher.svelte";
	import ApiIndicator from "$lib/components/apiIndicator.svelte";
	import settings from "$lib/settings";
	import defenseUnicorns from "../../static/Defense Unicorns - 1 line - Horizontal1.png"
	import { env } from "$env/dynamic/public";

	const branding: Boolean = env.PUBLIC_AI4NS_BRANDING === "true" ? true : false;
</script>

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
		<div class="unicornAI">
			<a href="/">
				<img src="DU_unicorn_rgb.png" alt="LeapfrogAI" class="logo" />
			</a>
			<h3>Unicorn AI</h3>
		</div>
		{/if}
	</div>
	<div class="flex items-center">
		<a href="/chat">Chat</a>
		<ApiIndicator type={$settings.chatModel} />
	</div>
	<!-- <div class="flex items-center">
		<a href="/upload">Transcribe</a>
		<ApiIndicator type={$settings.transcriptionModel} />
	</div> -->
	<!-- <div>
		<a href="/help">Help</a>
	</div> -->
	<div class="flex items-center">
		<ThemeSwitcher />
	</div>
</div>

<slot />

<style>
	.unicornAI{
		display: flex;
		flex-direction: row;
		align-items: end;
		gap: 1rem;
	}
	h3{
		font-size: 24px;
		color: white;
	}
	.logo{
		width: 40px;
	}
</style>