<script lang="ts">
	import '../app.css';
	import ThemeSwitcher from '$lib/components/themeSwitcher.svelte';
	import ApiIndicator from '$lib/components/apiIndicator.svelte';
	import settings from '$lib/settings';
</script>

<!-- Title Bar -->
<div
	class="fixed top-0 w-full flex items-center justify-between p-4 border-b border-inherit bg-base-100"
>
	<div class="flex items-center">
		<a href="/"><img src="leapfrogai.png" alt="LeapfrogAI" class="h-11" /></a>
	</div>
	<div class="flex items-center">
		<a href="/chat">Chat</a>
		<ApiIndicator type={$settings.chatModel} />
	</div>
	<div class="flex items-center">
		<a href="/upload">Transcribe</a>
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
