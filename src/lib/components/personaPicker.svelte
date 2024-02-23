<script lang="ts">
    import { env } from "$env/dynamic/public";
    import { onMount } from "svelte";
    import { v4 as uuidv4 } from "uuid";

    export let pickedPersona: Agent;

    let localStorage: Storage;
    let personas = [
        {
            uuid: uuidv4(),
            name: "HR Representative",
            description: "Description for Persona 1",
            model: env.PUBLIC_DEFAULT_MODEL,
            url: env.PUBLIC_OPENAI_API_HOST,
            type: "Chat",
            systemPrompt: env.PUBLIC_DEFAULT_SYSTEM_PROMPT,
            temperature: Number(env.PUBLIC_DEFAULT_TEMPERATURE),
            rag_enabled: false,
        },
        {
            uuid: uuidv4(),
            name: "LeapfrogAI Dev",
            description: "Description for Persona 2",
            model: env.PUBLIC_DEFAULT_MODEL,
            url: env.PUBLIC_OPENAI_API_HOST,
            type: "Chat",
            systemPrompt: env.PUBLIC_DEFAULT_SYSTEM_PROMPT,
            temperature: Number(env.PUBLIC_DEFAULT_TEMPERATURE),
            rag_enabled: false,
        },
        {
            uuid: uuidv4(),
            name: "Growth Engineer",
            description: "Description for Persona 3",
            model: env.PUBLIC_DEFAULT_MODEL,
            url: env.PUBLIC_OPENAI_API_HOST,
            type: "Chat",
            systemPrompt: env.PUBLIC_DEFAULT_SYSTEM_PROMPT,
            temperature: Number(env.PUBLIC_DEFAULT_TEMPERATURE),
            rag_enabled: false,
        },
        {
            uuid: uuidv4(),
            name: "Website Engineer",
            description: "Description for Persona 4",
            model: env.PUBLIC_DEFAULT_MODEL,
            url: env.PUBLIC_OPENAI_API_HOST,
            type: "Chat",
            systemPrompt: env.PUBLIC_DEFAULT_SYSTEM_PROMPT,
            temperature: Number(env.PUBLIC_DEFAULT_TEMPERATURE),
            rag_enabled: false,
        },
    ];

    let defaultSettings: Agent = {
        uuid: uuidv4(),
        name: "HR Representative",
        description: "",
        model: env.PUBLIC_DEFAULT_MODEL,
        url: env.PUBLIC_OPENAI_API_HOST,
        type: "Chat",
        systemPrompt: env.PUBLIC_DEFAULT_SYSTEM_PROMPT,
        temperature: Number(env.PUBLIC_DEFAULT_TEMPERATURE),
        rag_enabled: false,
    };

    onMount(() => {
        localStorage = window.localStorage;
        getLocalPersonas();
    });

    function getLocalPersonas() {
        if (localStorage) {
            const storedPersonas = JSON.parse(localStorage.getItem("personas"));
            if (storedPersonas?.length > 0) {
                personas = storedPersonas;
            }
        }

        if (personas.length === 0) {
            personas = [defaultSettings];
        }

        pickedPersona = personas[0];
    }

    function persistPersonas(value: any[]) {
        if (localStorage) {
            localStorage.setItem("personas", JSON.stringify(value));
        }
    }

    getLocalPersonas();

    function applyPersona(persona: any) {
        pickedPersona = persona;
        console.log(pickedPersona)
    }
</script>

<div class="w-72 p-4 h-full fixed top-20 right-0 overflow-y-auto">
    {#each personas as persona}
    
            <div class="menu bg-base-100 w-full rounded-box">
                <div class="flex">
                    <li class="w-4/6 flex-nowrap">
                        <button
                            class="whitespace-nowrap {persona.uuid === pickedPersona.uuid ? 'outline outline-2 outline-offset-2 outline-secondary' : ''}"
                            on:click={() => {
                                applyPersona(persona);
                                console.log(persona.name)
                            }}>{persona.name}</button>
                    </li>
                </div>
            </div>
    {/each}
</div>


<style>
    .flex{
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 1rem;
    }
    .button{
        width: 200px;
        border: 2px lightgrey solid;
        border-radius: 5px;
    }
</style>