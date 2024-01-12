<script lang="ts">
    import { urlConcat } from "$lib/helper";
    import { Indicator } from "flowbite-svelte";
    import { onMount } from "svelte";

    export let apiReady = false;

    onMount(async () => {
        apiReady = await getModels();
    });

    async function getModels() {
        const response = await fetch(urlConcat("/api/models"));
        const models = await response.json();
        return models.length > 0;
    }
</script>

<span class="flex items-center ml-2">
    <Indicator color={apiReady ? "green" : "red"} size="sm" />
</span>
