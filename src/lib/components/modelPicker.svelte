<script lang="ts">
    import { writable } from "svelte/store";
    import { onMount } from "svelte";
    import { urlConcat } from "$lib/helper";

    export let selectedModel = "";
    let models = writable([]);

    onMount(async () => {
        models.set(await getModels());
    });

    async function getModels() {
        const response = await fetch(urlConcat("/api/models"));
        const models = await response.json();
        return models;
    }
</script>

<div class="mb-2">
    <select
        id="model"
        bind:value={selectedModel}
        class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
    >
        {#each $models as model}
            <option value={model}>{model}</option>
        {/each}
    </select>
</div>
