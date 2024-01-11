<script lang="ts">
    import { writable } from "svelte/store";
    import { env } from "$env/dynamic/public";
    import { onMount } from "svelte";
    import { getModels } from "$lib/getModels";

    let selectedModel = env.PUBLIC_DEFAULT_MODEL;
    let systemPrompt = env.PUBLIC_DEFAULT_SYSTEM_PROMPT;
    let temperature = env.PUBLIC_DEFAULT_TEMPERATURE;
    let models = writable([null]);

    onMount(async () => {
        models.set(await getModels());
    });
</script>

<div class="modal-box">
    <div class="mb-2">
        <label for="model">Model:</label>
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
    <div class="mb-2">
        <label for="system-prompt">System Prompt:</label>
        <input
            class="input input-bordered w-full max-w-xs mb-2"
            id="system-prompt"
            type="text"
            bind:value={systemPrompt}
        />
    </div>
    <div class="mb-2">
        <label for="temperature">Temperature:</label>
        <input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={temperature}
        />
    </div>
    <!-- {#if ragEndpointActive}
            <div class="mb-2">
                <div>
                    <span>Retrieval Augmented Generation</span>
                    <input
                        type="checkbox"
                        class="checkbox"
                        bind:checked={ragEnabled}
                    />
                </div>
            </div>
        {/if} -->
</div>
