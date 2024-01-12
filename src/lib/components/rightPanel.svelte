<script lang="ts">
    import {
        EditOutline,
        PlusOutline,
        TrashBinOutline,
    } from "flowbite-svelte-icons";
    import { writable } from "svelte/store";
    import { env } from "$env/dynamic/public";
    import { onMount } from "svelte";
    import { urlConcat } from "$lib/helper";

    let localStorage;
    let personas = writable([]);
    let models = writable([null]);

    let personaSearch = "";
    let currentPersonaId = 0;
    let personaId = 0;
    let selectedModel = env.PUBLIC_DEFAULT_MODEL;
    let systemPrompt = env.PUBLIC_DEFAULT_SYSTEM_PROMPT;
    let temperature = env.PUBLIC_DEFAULT_TEMPERATURE;

    // Default persona values
    let defaultPersonaName = "New Persona";
    let defaultPersonaDescription = "Describe this persona here.";
    let defaultPersonaModel = selectedModel;
    let defaultPersonaTemperature = temperature;
    let defaultPersonaSystemPrompt = systemPrompt;

    onMount(async () => {
        localStorage = window.localStorage;
        models.set(await getModels());
        defaultPersonaModel = models[0];
        getLocalPersonas();
    });

    async function getModels() {
        const response = await fetch(urlConcat("/api/models"));
        const models = await response.json();
        return models;
    }

    function newPersona() {
        personas.update((n) => [
            ...n,
            {
                id: personaId++,
                name: defaultPersonaName,
                description: defaultPersonaDescription,
                temperature: defaultPersonaTemperature,
                model: defaultPersonaModel,
                systemPrompt: defaultPersonaSystemPrompt,
            },
        ]);
    }

    function updatePersona() {
        personas.update((n) => {
            const persona = n.find((p) => p.id === currentPersonaId);
            if (persona) {
                persona.name = $personas[currentPersonaId].name;
                persona.description = $personas[currentPersonaId].description;
                persona.systemPrompt = $personas[currentPersonaId].systemPrompt;
                persona.temperature = $personas[currentPersonaId].temperature;
                persona.model = $personas[currentPersonaId].model;
            }
            return n;
        });
        document.getElementById("persona_modal")["close"]();
    }

    function getLocalPersonas() {
        if (localStorage) {
            const storedPersonas = JSON.parse(localStorage.getItem("personas"));
            if (storedPersonas?.length > 0) {
                personas.set(storedPersonas);
            }
        }
    }

    function persistPersonas(value: any[]) {
        if (localStorage) {
            localStorage.setItem("personas", JSON.stringify(value));
        }
    }

    personas.subscribe(persistPersonas);

    function applyPersona(persona) {
        systemPrompt = persona.systemPrompt;
        temperature = persona.temperature;
        selectedModel = persona.model;
    }

    function removePersona(id) {
        personas.update((n) => n.filter((p) => p.id !== id));
    }
</script>

<div class="w-72 p-4 h-full fixed top-20 right-0 overflow-y-auto">
    <div class="w-72 p-4 h-full fixed top-20 right-0 overflow-y-auto">
        <button class="btn w-full mb-2 justify-between" on:click={newPersona}>
            New persona
            <PlusOutline />
        </button>
        <input
            class="input input-bordered w-full mb-2"
            type="text"
            placeholder="Search"
            bind:value={personaSearch}
        />
        {#each $personas as persona}
            {#if personaSearch == "" || persona.name
                    .toLowerCase()
                    .includes(personaSearch.toLowerCase())}
                <div class="menu bg-base-100 w-full rounded-box">
                    <div class="flex">
                        <li class="w-4/6 flex-nowrap">
                            <button
                                class="whitespace-nowrap"
                                on:click={() => {
                                    applyPersona(persona);
                                }}>{persona.name}</button
                            >
                        </li>
                        <button
                            class="btn-ghost w-1/6 px-2"
                            on:click={() => {
                                document
                                    .getElementById("persona_modal")
                                    ["showModal"]();
                                currentPersonaId = persona.id;
                            }}><EditOutline /></button
                        >
                        <button
                            class="btn-ghost w-1/6 px-2"
                            on:click={() => removePersona(persona.id)}
                            ><TrashBinOutline /></button
                        >
                    </div>
                </div>
            {/if}
        {/each}
    </div>
</div>

{#if $personas.length > 0}
    <dialog id="persona_modal" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">
                {$personas[currentPersonaId].name}
            </h3>
            <form on:submit|preventDefault={updatePersona}>
                <div class="py-2">
                    <label for="persona-name">Name:</label>
                    <input
                        id="persona-name"
                        type="text"
                        bind:value={$personas[currentPersonaId].name}
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <div class="py-2">
                    <label for="persona-description">Description:</label>
                    <input
                        id="persona-description"
                        type="text"
                        bind:value={$personas[currentPersonaId].description}
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <div class="py-2">
                    <label for="persona-model">Model:</label>
                    <select
                        id="persona-model"
                        bind:value={$personas[currentPersonaId].model}
                        class="shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
                    >
                        {#each $models as model}
                            <option value={model}>{model}</option>
                        {/each}
                    </select>
                </div>
                <div class="py-4">
                    <label for="persona-temperature">Temperature:</label>
                    <input
                        id="persona-temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        bind:value={$personas[currentPersonaId].temperature}
                    />
                </div>
                <div class="py-4">
                    <label for="persona-system-prompt">System Prompt:</label>
                    <input
                        id="persona-system-prompt"
                        type="textarea"
                        bind:value={$personas[currentPersonaId].systemPrompt}
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <div class="modal-action">
                    <button type="submit" class="btn">Save</button>
                    <button
                        type="button"
                        class="btn"
                        on:click={() =>
                            document.getElementById("persona_modal")["close"]()}
                        >Close</button
                    >
                </div>
            </form>
        </div>
    </dialog>
{/if}
