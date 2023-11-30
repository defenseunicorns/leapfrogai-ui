<script lang="ts">
    import { Heading, Input, Label, Indicator } from "flowbite-svelte";
    import {
        ArrowRightSolid,
        EditOutline,
        SunOutline,
        SunSolid,
        TrashBinSolid,
        UserSettingsSolid,
    } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import {writable} from "svelte/store";
    import configs from "../configs.json";

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
        fetch("/api/rag/health")
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
        const response = await fetch("/api/models");
        const models = await response.json();
        return models;
    }

    function newFolder() {
        folders.update((n) => [...n, "New Folder"]);
    }

    function clearFolders() {
        folders.set([]);
    }

    let chatId = 0;
    let currentConversation = writable(null);

    function persistConversations(value: any[]) {
        if (localStorage) {
            localStorage.setItem("conversations", JSON.stringify(value));
        }
    }

    conversations.subscribe(persistConversations);

    function newChat() {
        conversations.update((n) => [
            ...n,
            { id: chatId++, name: "New conversation", messages: [] },
        ]);
        currentConversation.set(chatId - 1);
    }

    function clearConversations() {
        conversations.set([]);
    }

    async function queryRag(query) {
        try {
            return await fetch("/api/rag/query", {
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

                    await fetch("/api/rag/upload", {
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

    let selectedModel = configs.DEFAULT_MODEL;
    let systemPrompt = configs.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT;
    let temperature = 0.5;
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
                newChat();
                currentConversation.set(chatId - 1); // Set the current conversation to the newly created one
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
        const myRequest = new Request("/api/chat-completion", {
            method: "POST",
            body: JSON.stringify(chatCompletion),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${configs.OPENAI_API_KEY}`,
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
        document.getElementById("persona_modal")['close']();
    }

    let folders = writable([]);

    function removeFolder(index) {
        folders.update((folders) => {
            folders.splice(index, 1);
            return folders;
        });
    }

    function removeConversation(id) {
        conversations.update((n) => n.filter((c) => c.id !== id));
    }

    function removePersona(id) {
        personas.update((n) => n.filter((p) => p.id !== id));
    }

    let editingFolderIndex = -1;
    let tempFolderName = "";

    function startEditingFolderName(index) {
        editingFolderIndex = index;
        tempFolderName = $folders[index];
    }

    function handleKeyDown(event) {
        if (event.key === "Enter") {
            editFolderName(tempFolderName);
        }
    }

    function editFolderName(newName) {
        folders.update((folders) => {
            folders[editingFolderIndex] = newName;
            return folders;
        });
        editingFolderIndex = -1;
    }

    let editingConversationIndex = -1;
    let tempConversationName = "";

    function startEditingConversationName(index) {
        editingConversationIndex = index;
        tempConversationName = $conversations[index].name;
    }

    function handleConversationKeyDown(event) {
        if (event.key === "Enter") {
            editConversationName(tempConversationName);
        }
    }

    function editConversationName(newName) {
        conversations.update((conversations) => {
            conversations[editingConversationIndex].name = newName;
            return conversations;
        });
        editingConversationIndex = -1;
    }

    let theme = writable("dark");

    function toggleTheme() {
        console.log("We toggled it");
        $theme === "dark" ? theme.set("light") : theme.set("dark");
    }
</script>

<div class="flex flex-col h-screen bg-dark-blue {$theme}">
    <!-- Title Bar -->
    <div class="flex items-center justify-between p-4 border-b border-white">
        <img src="leapfrogai.png" alt="LeapfrogAI" class="w-40" />
        <label class="swap swap-rotate" on:change={toggleTheme}>
            <!-- this hidden checkbox controls the state -->
            <input type="checkbox" class="invisible" />

            <SunSolid class="swap-on" />
            <SunOutline class="swap-off" />
        </label>
    </div>
    <div class="flex flex-grow">
        <!-- Side Panel 1 -->
        <div class="w-1/5 bg-blue-800 p-4 flex flex-col text-white">
            <Heading class="underline-heading" tag="h4">Conversations</Heading>
            <button class="btn mb-2" on:click={newChat}>New chat</button>
            <input
                class="input input-bordered w-full max-w-xs mb-2"
                type="text"
                placeholder="Search"
                bind:value={conversationSearch}
            />
            {#if $conversations.length > 0}
                <div class="menu bg-base-200 w-full rounded-box">
                    {#each $conversations as conversation}
                        {#if conversationSearch == "" || conversation.name
                                .toLowerCase()
                                .includes(conversationSearch.toLowerCase())}
                            <div class="flex">
                                {#if editingConversationIndex === conversation.id}
                                    <input
                                        class="input input-bordered w-full max-w-xs mb-2"
                                        type="text"
                                        bind:value={tempConversationName}
                                        on:keydown={handleConversationKeyDown}
                                        autofocus
                                    />
                                {:else}
                                    <button
                                        class="btn"
                                        on:click={() =>
                                            currentConversation.set(
                                                conversation.id,
                                            )}>{conversation.name}</button
                                    >
                                    <button
                                        class="btn"
                                        on:click={() =>
                                            startEditingConversationName(
                                                conversation.id,
                                            )}><EditOutline /></button
                                    >
                                {/if}
                                <button
                                    class="btn"
                                    on:click={() =>
                                        removeConversation(conversation.id)}
                                    ><TrashBinSolid /></button
                                >
                            </div>
                        {/if}
                    {/each}
                </div>
            {/if}
            <button class="btn mb-2" on:click={clearConversations}
                >Clear conversations</button
            >
            <Heading class="underline-heading" tag="h4">Folders</Heading>
            <button class="btn mb-2" on:click={newFolder}>New folder</button>
            {#if $folders.length > 0}
                <div class="menu bg-base-200 w-full rounded-box">
                    {#each $folders as folder, index}
                        <div class="flex">
                            {#if editingFolderIndex === index}
                                <input
                                    class="input input-bordered w-full max-w-xs mb-2"
                                    type="text"
                                    bind:value={tempFolderName}
                                    on:keydown={handleKeyDown}
                                    autofocus
                                />
                            {:else}
                                <button class="btn">{folder}</button>
                                <button
                                    class="btn"
                                    on:click={() =>
                                        startEditingFolderName(index)}
                                    ><EditOutline /></button
                                >
                            {/if}
                            <button
                                class="btn"
                                on:click={() => removeFolder(index)}
                                ><TrashBinSolid /></button
                            >
                        </div>
                    {/each}
                </div>
            {/if}
            <button class="btn mb-2" on:click={clearFolders}
                >Clear Folders</button
            >
            <Heading class="underline-heading" tag="h4">Data Management</Heading
            >
            {#if ragEndpointActive}
                <input
                    type="file"
                    accept=".txt,.pdf"
                    on:change={importFiles}
                    bind:this={fileInputRag}
                    multiple={true}
                    class="hidden"
                />
                <button class="btn mb-2" on:click={() => fileInputRag.click()}
                    >Import files</button
                >
            {/if}
            <input
                type="file"
                accept=".json"
                on:change={importData}
                bind:this={fileInput}
                class="hidden"
            />
            <button class="btn mb-2" on:click={() => fileInput.click()}
                >Import data</button
            >
            <button class="btn mb-2" on:click={exportData}>Export data</button>
            <button
                class="btn mb-2"
                on:click={() => (showSettingsModal = !showSettingsModal)}
                >Settings</button
            >
        </div>

        <!-- Center Panel -->
        <div class="w-3/5 bg-blue-600 p-4 flex flex-col text-white">
            <div
                bind:this={chatContainer}
                class="chat-container mb-2 overflow-auto flex-grow"
            >
                {#if $currentConversation !== null && $conversations.find((c) => c.id === $currentConversation)}
                    {#each $conversations.find((c) => c.id === $currentConversation).messages as message}
                        <Label class="message-label">{message.role}</Label>
                        <div
                            class="p-2 m-2 rounded {message.role === 'user'
                                ? 'user-message'
                                : 'assistant-message'} text-black"
                        >
                            {message.content}
                        </div>
                    {/each}
                {/if}
            </div>
            <button class="btn mb-2" on:click={regenerateResponse}
                >Regenerate Response</button
            >
            <div class="mb-2 flex items-center">
                <form
                    on:submit|preventDefault={sendMessage}
                    class="mb-2 flex-grow items-center"
                >
                    <Input
                        id="small-input"
                        size="sm"
                        placeholder="Type your message here..."
                        bind:value={$currentMessage}
                        class="flex p-2"
                    />
                </form>
                <button on:click={sendMessage} class="btn ml-2 p-2">
                    <ArrowRightSolid />
                </button>
                <button
                    class="btn ml-2 p-2"
                    on:click={() => (showSettingsModal = !showSettingsModal)}
                >
                    <UserSettingsSolid />
                </button>
                <span class="flex items-center ml-2">
                    {#if !$loading}
                        <Indicator color="green" size="sm"/>
                    {:else}
                        <Indicator color="red" size="sm"/>
                    {/if}
                </span>
            </div>
        </div>

        <!-- Side Panel 2 -->
        <div class="w-1/5 bg-blue-800 p-4 flex flex-col text-white">
            <Heading class="underline-heading" tag="h4">Personas</Heading>
            <button class="btn mb-2" on:click={newPersona}>New persona</button>
            <input
                class="input input-bordered w-full max-w-xs mb-2"
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
                                    document.getElementById("persona_modal")['showModal']();
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
                <button class="btn mb-2" on:click={savePersona}>Save</button>
                <button class="btn mb-2" on:click={cancelPersona}>Cancel</button
                >
            {/if}
        </div>
    </div>
</div>

{#if showSettingsModal}
    <div class="fixed inset-0 flex items-center justify-center z-10">
        <div class="modal-box p-4 rounded shadow-lg">
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
            <button class="btn" on:click={() => (showSettingsModal = false)}
                >Close</button
            >
        </div>
    </div>
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
                        on:click={() => document.getElementById("persona_modal")['close']() }
                        >Close</button
                    >
                </div>
            </form>
        </div>
    </dialog>
{/if}
