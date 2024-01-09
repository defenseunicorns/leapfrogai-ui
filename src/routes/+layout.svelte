<script lang="ts">
	import "../app.css";
	import ThemeSwitcher from "$lib/components/themeSwitcher.svelte";
</script>

<!-- Title Bar -->
<div class="fixed top-0 w-full flex items-center justify-between p-4 border-b border-white bg-base-100">
	<div class="flex items-center">
		<img src="leapfrogai.png" alt="LeapfrogAI" class="w-40" />
	</div>
	<ThemeSwitcher />
</div>

<slot />

