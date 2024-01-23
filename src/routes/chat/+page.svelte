<script lang="ts">
    import {
        ArrowRightSolid,
        EditOutline,
        FileImportOutline,
        FileExportOutline,
        PlusOutline,
        RotateOutline,
        TrashBinOutline,
    } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { urlConcat } from "$lib/helper";
    import SvelteMarkdown from "svelte-markdown";
    import codeblock from "$lib/components/codeblock.svelte";
    import codespan from "$lib/components/codespan.svelte";
    import { v4 as uuidv4 } from "uuid";
    import PersonaPicker from "$lib/components/personaPicker.svelte";
    import settings from '$lib/settings';
    import type {ModelSettings} from '$lib/settings'
    import { PUBLIC_TRANSCRIPTION_MODEL } from "$env/static/public";

    let localStorage;
    let conversations = writable([]);
    let models = writable([null]);
    let fileInput;
    let fileInputRag;
    let ragEndpointActive = false;
    let ragEnabled = false;

    let currentSettings: Agent;

    function updateModelIndicators(value: Agent) {
        if (currentSettings) {
            const modelSettings: ModelSettings = {
                chatModel: value.model,
                transcriptionModel: PUBLIC_TRANSCRIPTION_MODEL
            }

            settings.set(modelSettings)
        }
    }

    $: updateModelIndicators(currentSettings)

    onMount(async () => {
        // required to access localStorage after mount
        localStorage = window.localStorage;
        getLocalConversations();
        models.set(await getModels());
        await updateRagEndpointState();
    });

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
            { id: uuidv4(), name: "New conversation", messages: [] },
        ]);
        currentConversation.set(chatUuid);
        return chatUuid;
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
        a.download = "leapfrogai_history_" + Date.now();
        a.click();

        URL.revokeObjectURL(a.href);
    }

    // @ts-ignore
    let chatContainer;

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    let currentMessage = writable("");
    let conversationSearch = "";

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
                    content: currentSettings.systemPrompt,
                },
                ...conversationMessages,
            ],
            model: currentSettings.model,
            max_tokens: 1000,
            temperature: currentSettings.temperature,
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
                                scrollToBottom()
                                return pump();
                            });
                        }
                    },
                });
            })
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

    function editConversation(conversationId: number) {
        if (editingConversationIndex === conversationId) {
            editConversationName(tempConversationName);
        } else {
            startEditingConversationName(conversationId);
        }
    }

    function removeConversation(id) {
        conversations.update((n) => n.filter((c) => c.id !== id));
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
</script>

<svelte:head>
    <title>Chat</title>
</svelte:head>

<div class="flex flex-col h-screen">
    <div class="flex flex-grow">
        <!-- Side Panel 1 -->
        <div class="flex flex-col">
            <div class="w-72 p-4 pb-60 h-full fixed top-20 left-0">
                <button
                    class="btn mb-2 w-full justify-between"
                    on:click={newChat}
                >
                    New chat
                    <PlusOutline />
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
                                                    on:click={async () =>
                                                            currentConversation.set(conversation.id)
                                                    }
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
                                            ><EditOutline />
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
                        Import Chats
                        <FileImportOutline />
                    </button>
                </div>
                <div>
                    <button
                        class="btn btn-ghost w-full flex justify-between"
                        on:click={exportData}
                    >
                        Export Chats
                        <FileExportOutline />
                    </button>
                </div>
            </div>
        </div>

        <!-- Center Panel -->
        <div class="w-full pb-4 pt-4 flex flex-col ml-72 mr-72 mt-20 mb-10 overflow-x-scroll">
            {#if $currentConversation !== null && $conversations.find((c) => c.id === $currentConversation)}
                <div
                    bind:this={chatContainer}
                    class="chat-container overflow-auto flex-grow"
                >
                    {#each $conversations.find((c) => c.id === $currentConversation).messages as message}
                        <div class="chat-header">{message.role}</div>
                        <div
                            class="p-2 m-2 rounded {message.role === 'user'
                                ? 'user-message'
                                : 'assistant-message'}"
                        >
                            <SvelteMarkdown on:parsed={() => scrollToBottom()}
                                source={message.content}
                                renderers={{
                                    code: codeblock,
                                    codespan: codespan,
                                }}
                            />
                        </div>
                    {/each}
                </div>
            {/if}

            <div
                class="fixed right-72 left-72 bottom-0 flex items-center p-4 bg-base-100"
            >
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
                </div>
            </div>
        </div>

        <!-- Side Panel 2 -->
        <PersonaPicker bind:pickedPersona={currentSettings}/>
    </div>
</div>
