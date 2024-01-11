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
    let showPersonaDetails = false;
    let newPersonaName = "";
    let newPersonaDescription = "";
    let personaSearch = "";
    let currentPersonaId = 0;
    let personaId = 0;
    let selectedModel = env.PUBLIC_DEFAULT_MODEL;
    let systemPrompt = env.PUBLIC_DEFAULT_SYSTEM_PROMPT;
    let temperature = env.PUBLIC_DEFAULT_TEMPERATURE;
    let newPersonaSystemPrompt = systemPrompt;
    let newPersonaTemperature = temperature;
    let newPersonaModel = selectedModel;

    onMount(async () => {
        localStorage = window.localStorage;
        models.set(await getModels());
        getLocalPersonas();
    });

    async function getModels() {
        const response = await fetch(urlConcat("/api/models"));
        const models = await response.json();
        return models;
    }

    function newPersona() {
        showPersonaDetails = !showPersonaDetails;
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

    function savePersona() {
        personas.update((n) => [
            ...n,
            {
                id: personaId++,
                name: newPersonaName,
                description: newPersonaDescription,
                temperature: newPersonaTemperature,
                model: newPersonaModel,
                systemPrompt: newPersonaSystemPrompt,
            },
        ]);
        showPersonaDetails = false;
        clearNewPersona();
    }

    function clearNewPersona() {
        newPersonaName = "";
        newPersonaDescription = "";
        newPersonaSystemPrompt = systemPrompt;
        newPersonaTemperature = temperature;
        newPersonaModel = selectedModel;
    }

    function cancelPersona() {
        showPersonaDetails = false;
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
        {#if showPersonaDetails}
            <div class="text=large">Persona Details</div>
            <div class="mb-2">
                <input
                    id="persona-name"
                    type="text"
                    placeholder="Persona Name..."
                    bind:value={newPersonaName}
                    class="input input-bordered w-full max-w-xs mb-2"
                />
            </div>
            <div class="mb-2">
                <input
                    id="persona-description"
                    type="text"
                    placeholder="Persona Description..."
                    bind:value={newPersonaDescription}
                    class="input input-bordered w-full max-w-xs mb-2"
                />
            </div>
            <div class="mb-2">
                <label for="model">Model:</label>
                <select
                    id="model"
                    bind:value={newPersonaModel}
                    class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
                >
                    {#each $models as model}
                        <option value={model}>{model}</option>
                    {/each}
                </select>
            </div>
            <div class="mb-2">
                <label for="temperature">Temperature:</label>
                <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    bind:value={newPersonaTemperature}
                />
            </div>


            <div class="mb-2">
                <input
                    id="persona-system-prompt"
                    type="text"
                    placeholder="System Prompt..."
                    bind:value={newPersonaSystemPrompt}
                    class="input input-bordered w-full max-w-xs mb-2"
                />
            </div>
            <button class="btn mb-2" on:click={savePersona}>Save</button>
            <button class="btn mb-2" on:click={cancelPersona}>Cancel</button>
        {/if}
    </div>
</div>
