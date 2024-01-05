<script lang="ts">
    import { Heading, Input, Label, Indicator } from "flowbite-svelte";
    import {
        AnnotationOutline,
        ArrowRightSolid,
        EditOutline,
        RotateOutline,
        SunOutline,
        SunSolid,
        TrashBinSolid,
        TrashBinOutline,
        UserEditOutline,
        UserEditSolid,
        UserSettingsSolid,
        FileImportOutline,
    } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { env } from "$env/dynamic/public";
    import { urlConcat } from "$lib/helper";
    import SvelteMarkdown from "svelte-markdown";
    import codeblock from "$lib/components/codeblock.svelte";
    import codespan from "$lib/components/codespan.svelte";
    import { v4 as uuidv4 } from "uuid";

    /** @type {import('./$types').LayoutData} */
    export let data;

    let localStorage;
    let conversations = writable([]);
    let personas = writable([]);
    let models = writable([]);
    let loading = writable(true);
    let showSettings = false;
    let fileInput;
    let fileInputRag;

    let ragEndpointActive = false;
    let ragEnabled = false;

    async function updateRagEndpointState() {
        fetch(urlConcat("/api/rag/health"))
            .then((response) => response.json())
            .then((body) => {
                ragEndpointActive = body.enabled;
            })
            .catch((e) => {
                console.log(e);
            });
    }

    onMount(async () => {
        loading.set(true);
        // required to access localStorage after mount
        localStorage = window.localStorage;
        getLocalConversations();

        models.set(await getModels());
        loading.set(false);
        await updateRagEndpointState();
    });

    function getLocalConversations() {
        if (localStorage) {
            const storedConversations = JSON.parse(
                localStorage.getItem("conversations"),
            );
            if (storedConversations?.length > 0) {
                conversations.set(storedConversations);
            }
        }
    }

    async function getModels() {
        const response = await fetch(urlConcat("/api/models"));
        const models = await response.json();
        return models;
    }

    let chatUuid: string;
    let currentConversation = writable(null);

    function persistConversations(value: any[]) {
        if (localStorage) {
            localStorage.setItem("conversations", JSON.stringify(value));
        }
    }

    conversations.subscribe(persistConversations);

    function newChat(): string {
        chatUuid = uuidv4();
        conversations.update((n) => [
            ...n,
            { id: chatUuid, name: "New conversation", messages: [] },
        ]);
        currentConversation.set(chatUuid);
        return chatUuid;
    }

    function clearConversations() {
        conversations.set([]);
    }

    async function queryRag(query) {
        try {
            return await fetch(urlConcat("/api/rag/query"), {
                method: "POST",
                body: JSON.stringify({
                    input: query,
                    collection_name: "default",
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((response) => {
                return response.text();
            });
        } catch (error) {
            console.error(error);
        }
    }

    async function importFiles(event) {
        const files = event.target.files;

        for (let i = 0; i < files.length; i++) {
            const file = event.target.files[i];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append("file", file);

                    await fetch(urlConcat("/api/rag/upload"), {
                        method: "POST",
                        body: formData,
                    });

                    // Clear the file input for potential future use
                    event.target.value = "";
                } catch (error) {
                    console.error("Error reading or parsing JSON:", error);
                }
            }
        }
    }

    async function importData(event) {
        const file = event.target.files[0];
        if (file) {
            try {
                const fileText = await file.text();

                conversations.set(JSON.parse(fileText));
                // Clear the file input for potential future use
                event.target.value = "";
            } catch (error) {
                console.error("Error reading or parsing JSON:", error);
            }
        }
    }

    function exportData() {
        const conversationJson = JSON.stringify($conversations, null, 2);
        const blob = new Blob([conversationJson], { type: "application/json" });
        const a = document.createElement("a");

        a.href = URL.createObjectURL(blob);
        a.download = "ask_frogs_history_" + Date.now();
        a.click();

        URL.revokeObjectURL(a.href);
    }

    function settings() {
        showSettings = !showSettings;
    }

    function pluginKeys() {
        // dummy function
    }

    function newPersona() {
        showPersonaDetails = !showPersonaDetails;
    }

    function applyPersona(persona) {
        systemPrompt = persona.systemPrompt;
        temperature = persona.temperature;
        selectedModel = persona.model;
    }

    // @ts-ignore
    let chatContainer;

    function scrollToBottom() {
        // @ts-ignore
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    let selectedModel = env.PUBLIC_DEFAULT_MODEL;
    let systemPrompt = env.PUBLIC_DEFAULT_SYSTEM_PROMPT;
    let temperature = env.PUBLIC_DEFAULT_TEMPERATURE;
    let currentMessage = writable("");
    let showPersonaDetails = false;
    let showSettingsModal = false;
    let conversationSearch = "";
    let personaSearch = "";
    let currentPersonaId = 0;

    // @ts-ignore
    function getMessage(source, text) {
        return { role: source, content: text };
    }

    async function sendMessage() {
        let lastMessage = getMessage("user", $currentMessage);

        if ($currentMessage.trim() !== "") {
            // If there's no current conversation, create a new one
            if ($currentConversation === null) {
                currentConversation.set(newChat()); // Set the current conversation to the newly created one
            }

            conversations.update((n) => {
                const conversation = n.find(
                    (c) => c.id === $currentConversation,
                );
                if (conversation) {
                    conversation.messages.push(lastMessage);
                }
                return n;
            });
            currentMessage.set("");
        }

        /* Copy the current messages into a new array so that the RAG results can be
            inserted without changing what the user sees. */
        let conversationMessages = [
            ...$conversations.find((c) => c.id === $currentConversation)
                .messages,
        ];

        // Only use RAG if the server is available and if the user has it enabled
        if (ragEndpointActive && ragEnabled) {
            // Construct the RAG message that will be inserted before the user's message
            let ragResponse = {
                role: "system",
                content: await queryRag(lastMessage.content),
            };

            // Insert the RAG message before the user's message
            conversationMessages.splice(
                conversationMessages.length - 1,
                0,
                ragResponse,
            );
        }

        // Payload to send to the local chat-completion endpoint
        let chatCompletion = {
            key: "",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...conversationMessages,
            ],
            model: selectedModel,
            max_tokens: 1000,
            temperature: temperature,
        };

        // Create a new assistant message with empty content
        let newMessage = getMessage("assistant", "");
        conversations.update((n) => {
            const conversation = n.find((c) => c.id === $currentConversation);
            if (conversation) {
                conversation.messages.push(newMessage);
            }
            return n;
        });

        // Request is sent to the local-chat completion server, then routed to the real endpoint
        const myRequest = new Request(urlConcat("/api/chat-completion"), {
            method: "POST",
            body: JSON.stringify(chatCompletion),
            headers: {
                "Content-Type": "application/json",
            },
        });

        fetch(myRequest)
            .then((response) => response.body)
            .then((body) => {
                const reader = body.getReader();
                return new ReadableStream({
                    start(controller) {
                        return pump();
                        function pump() {
                            return reader.read().then(({ done, value }) => {
                                // When no more data needs to be consumed, close the stream
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                // Enqueue the next data chunk into our target stream
                                controller.enqueue(value);
                                const textValue = new TextDecoder().decode(
                                    value,
                                );
                                newMessage.content += textValue;
                                conversations.set($conversations);
                                return pump();
                            });
                        }
                    },
                });
            });

        scrollToBottom();
    }

    async function regenerateResponse() {
        // Remove the last assistant message
        $conversations[$currentConversation].messages = $conversations[
            $currentConversation
        ].messages.filter((message, index, self) => {
            return index !== self.length - 1 || message.role !== "assistant";
        });

        // Request a new message
        await sendMessage();
    }

    let newPersonaName = "";
    let newPersonaDescription = "";
    let personaId = 0;
    let newPersonaSystemPrompt = systemPrompt;
    let newPersonaTemperature = temperature;
    let newPersonaModel = selectedModel;

    function clearNewPersona() {
        newPersonaName = "";
        newPersonaDescription = "";
        newPersonaSystemPrompt = systemPrompt;
        newPersonaTemperature = temperature;
        newPersonaModel = selectedModel;
    }

    function savePersona() {
        personas.update((n) => [
            ...n,
            {
                id: personaId++,
                name: newPersonaName,
                description: newPersonaDescription,
                systemPrompt: newPersonaSystemPrompt,
                temperature: newPersonaTemperature,
                model: newPersonaModel,
            },
        ]);
        showPersonaDetails = false;
        clearNewPersona();
    }

    function editConversation(conversationId: number) {
        if (editingConversationIndex === conversationId) {
            editConversationName(tempConversationName);
        } else {
            startEditingConversationName(conversationId);
        }
    }

    function cancelPersona() {
        showPersonaDetails = false;
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

    function removeConversation(id) {
        conversations.update((n) => n.filter((c) => c.id !== id));
    }

    function removePersona(id) {
        personas.update((n) => n.filter((p) => p.id !== id));
    }

    let editingConversationIndex = -1;
    let tempConversationName = "";

    function startEditingConversationName(index) {
        editingConversationIndex = index;
        tempConversationName = $conversations.filter((p) => p.id === index)[0]
            .name;
    }

    function handleConversationKeyDown(event) {
        if (event.key === "Enter") {
            editConversationName(tempConversationName);
        }
    }

    function editConversationName(newName) {
        conversations.update((conversations) => {
            $conversations.filter(
                (p) => p.id === editingConversationIndex,
            )[0].name = newName;
            return conversations;
        });
        editingConversationIndex = -1;
    }

    function toggleTheme() {
        console.log("We toggled it");
        data.theme === "dark" ? (data.theme = "light") : (data.theme = "dark");
    }
</script>

<div class="flex flex-col h-screen {data.theme}">
    <!-- Title Bar -->
    <div
        class="fixed top-0 w-full flex items-center justify-between p-4 border-b border-white bg-base-100"
    >
        <div class="flex items-center">
            <img src="leapfrogai.png" alt="LeapfrogAI" class="w-40" />
        </div>
        <label class="swap swap-rotate" on:change={toggleTheme}>
            <!-- this hidden checkbox controls the state -->
            <input type="checkbox" class="invisible" />

            <SunSolid class="swap-on" />
            <SunOutline class="swap-off" />
        </label>
    </div>
    <div class="flex flex-grow">

        <!-- Side Panel 1 -->
        <div class="flex flex-col">
            <div class="w-72 p-4 pb-60 h-full fixed top-20 left-0">
                <button
                    class="btn mb-2 w-full justify-between"
                    on:click={newChat}
                >
                    New chat
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 5.757v8.486M5.757 10h8.486M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                    </svg>
                </button>
                <input
                    class="input input-bordered w-full mb-2"
                    type="text"
                    placeholder="Search"
                    bind:value={conversationSearch}
                />
                <div
                    class="w-[268px] pb-96 h-full fixed top-52 left-0 overflow-y-auto"
                >
                    {#if $conversations.length > 0}
                        <div class="menu">
                            {#each $conversations as conversation}
                                {#if conversationSearch == "" || conversation.name
                                        .toLowerCase()
                                        .includes(conversationSearch.toLowerCase())}
                                    <div
                                        class="my-1 flex ml-1 flex-row w-full content-center"
                                    >
                                        {#if editingConversationIndex === conversation.id}
                                            <input
                                                class="input input-sm h-[36px] input-bordered w-4/6 flex-nowrap"
                                                type="text"
                                                bind:value={tempConversationName}
                                                on:keydown={handleConversationKeyDown}
                                            />
                                        {:else}
                                            <li class="w-4/6 flex-nowrap">
                                                <button
                                                    class="whitespace-nowrap"
                                                    on:click={() =>
                                                        currentConversation.set(
                                                            conversation.id,
                                                        )}
                                                >
                                                    <span
                                                        class="overflow-hidden"
                                                        >{conversation.name}</span
                                                    >
                                                </button>
                                            </li>
                                        {/if}
                                        <button
                                            class="btn-ghost w-1/6 px-2.5"
                                            on:click={() =>
                                                editConversation(
                                                    conversation.id,
                                                )}
                                        >
                                            {#if editingConversationIndex === conversation.id}
                                                <UserEditSolid />
                                            {:else}
                                                <UserEditOutline />
                                            {/if}
                                        </button>
                                        <button
                                            class="btn-ghost w-1/6 px-2"
                                            on:click={() =>
                                                removeConversation(
                                                    conversation.id,
                                                )}><TrashBinOutline /></button
                                        >
                                    </div>
                                {/if}
                            {/each}
                        </div>
                    {/if}
                </div>
                {#if ragEndpointActive}
                    <input
                        type="file"
                        accept=".txt,.pdf"
                        on:change={importFiles}
                        bind:this={fileInputRag}
                        multiple={true}
                        class="hidden"
                    />
                {/if}
                <input
                    type="file"
                    accept=".json"
                    on:change={importData}
                    bind:this={fileInput}
                    class="hidden"
                />
            </div>
            <div class="bg-base-100 w-72 p-4 pt-0 fixed bottom-0 left-0">
                <div class="border-t-2 border-neutral-700">
                    <button
                        class="btn btn-ghost w-full flex justify-between"
                        on:click={() => fileInput.click()}
                    >
                        Import data
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 8V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 7.828 1h8.239A.969.969 0 0 1 17 2v16a.969.969 0 0 1-.933 1H3.933A.97.97 0 0 1 3 18v-2M8 1v4a1 1 0 0 1-1 1H3m-2 6h10M9.061 9.232 11.828 12l-2.767 2.768"
                            />
                        </svg>
                    </button>
                </div>
                <div>
                    <button
                        class="btn btn-ghost w-full flex justify-between"
                        on:click={exportData}
                    >
                        Export data
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15 6V2a.97.97 0 0 0-.933-1H5.828a2 2 0 0 0-1.414.586L1.586 4.414A2 2 0 0 0 1 5.828V18a.969.969 0 0 0 .933 1H14a1 1 0 0 0 1-1M6 1v4a1 1 0 0 1-1 1H1m6 6h9m-1.939-2.768L16.828 12l-2.767 2.768"
                            />
                        </svg>
                    </button>
                </div>
                <div>
                    <button
                        class="btn btn-ghost w-full flex justify-between"
                        on:click={() =>
                            (showSettingsModal = !showSettingsModal)}
                    >
                        Settings
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <g
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                            >
                                <path
                                    d="M19 11V9a1 1 0 0 0-1-1h-.757l-.707-1.707.535-.536a1 1 0 0 0 0-1.414l-1.414-1.414a1 1 0 0 0-1.414 0l-.536.535L12 2.757V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v.757l-1.707.707-.536-.535a1 1 0 0 0-1.414 0L2.929 4.343a1 1 0 0 0 0 1.414l.536.536L2.757 8H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h.757l.707 1.707-.535.536a1 1 0 0 0 0 1.414l1.414 1.414a1 1 0 0 0 1.414 0l.536-.535L8 17.243V18a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.757l1.707-.708.536.536a1 1 0 0 0 1.414 0l1.414-1.414a1 1 0 0 0 0-1.414l-.535-.536.707-1.707H18a1 1 0 0 0 1-1Z"
                                />
                                <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Center Panel -->
        <div class="w-full pb-4 pt-4 flex flex-col ml-72 mr-72 mt-20 mb-20">
            <div
                bind:this={chatContainer}
                class="chat-container overflow-auto flex-grow"
            >
                {#if $currentConversation !== null && $conversations.find((c) => c.id === $currentConversation)}
                    {#each $conversations.find((c) => c.id === $currentConversation).messages as message}
                        <Label class="message-label">{message.role}</Label>
                        <div
                            class="p-2 m-2 rounded {message.role === 'user'
                                ? 'user-message'
                                : 'assistant-message'}"
                        >
                            <SvelteMarkdown
                                source={message.content}
                                renderers={{
                                    code: codeblock,
                                    codespan: codespan,
                                }}
                            />
                        </div>
                    {/each}
                {/if}
            </div>
            <div class="fixed right-72 left-72 bottom-0 flex items-center p-4 bg-base-100">
                <div class="mb-2 flex w-full items-center">
                    <button on:click={regenerateResponse} class="btn mr-2 p-2"
                        ><RotateOutline /></button
                    >
                    <form
                        on:submit|preventDefault={sendMessage}
                        class="flex-grow items-center"
                    >
                        <input
                            type="text"
                            placeholder="Type your message here..."
                            bind:value={$currentMessage}
                            class="input input-bordered w-full"
                        />
                    </form>
                    <button on:click={sendMessage} class="btn ml-2 p-2"
                        ><ArrowRightSolid /></button
                    >
                    <span class="flex items-center ml-2">
                        {#if !$loading}
                            <Indicator color="green" size="sm" />
                        {:else}
                            <Indicator color="red" size="sm" />
                        {/if}
                    </span>
                </div>
            </div>
        </div>

        <!-- Side Panel 2 -->
        <div class="w-72 p-4 h-full fixed top-20 right-0 overflow-y-auto">
            <button
                class="btn w-full mb-2 justify-between"
                on:click={newPersona}
            >
                New persona
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 8h6m-3 3V5m-6-.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0ZM5 11h3a4 4 0 0 1 4 4v2H1v-2a4 4 0 0 1 4-4Z"
                    />
                </svg>
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
                    <div class="menu bg-base-200 w-full rounded-box">
                        <div class="flex">
                            <button
                                class="btn"
                                on:click={() => {
                                    applyPersona(persona);
                                }}>{persona.name}</button
                            >
                            <button
                                class="btn"
                                on:click={() => {
                                    document
                                        .getElementById("persona_modal")
                                        ["showModal"]();
                                    currentPersonaId = persona.id;
                                }}><EditOutline /></button
                            >
                            <button
                                class="btn"
                                on:click={() => removePersona(persona.id)}
                                ><TrashBinSolid /></button
                            >
                        </div>
                    </div>
                {/if}
            {/each}
            {#if showPersonaDetails}
                <Heading class="underline-heading" tag="h5"
                    >Persona Details</Heading
                >
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
                    <input
                        id="persona-system-prompt"
                        type="text"
                        placeholder="System Prompt..."
                        bind:value={newPersonaSystemPrompt}
                        class="input input-bordered w-full max-w-xs mb-2"
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
                        bind:value={newPersonaTemperature}
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
                <button class="btn mb-2" on:click={savePersona}>Save</button
                >
                <button class="btn mb-2" on:click={cancelPersona}
                    >Cancel</button
                >
            {/if}
        </div>
    </div>
</div>

{#if showSettingsModal}
    <dialog class="fixed inset-0 flex items-center justify-center z-10">
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
            {#if ragEndpointActive}
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
            {/if}
            <button class="btn" on:click={() => (showSettingsModal = false)}>Close</button>
        </div>
    </dialog>
{/if}

{#if $personas.length > 0}
    <dialog id="persona_modal" class="modal">
        <div class="modal-box">
            <h3 class="font-bold text-lg">
                {$personas[currentPersonaId].name}
            </h3>
            <form on:submit|preventDefault={updatePersona}>
                <div class="py-4">
                    <label for="persona-name">Name:</label>
                    <input
                        id="persona-name"
                        type="text"
                        bind:value={$personas[currentPersonaId].name}
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <div class="py-4">
                    <label for="persona-description">Description:</label>
                    <input
                        id="persona-description"
                        type="text"
                        bind:value={$personas[currentPersonaId].description}
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <div class="py-4">
                    <label for="persona-system-prompt">System Prompt:</label>
                    <input
                        id="persona-system-prompt"
                        type="text"
                        bind:value={$personas[currentPersonaId].systemPrompt}
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
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
                    <label for="persona-model">Model:</label>
                    <select
                        id="persona-model"
                        bind:value={$personas[currentPersonaId].model}
                        class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
                    >
                        {#each $models as model}
                            <option value={model}>{model}</option>
                        {/each}
                    </select>
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

<style>
</style>
