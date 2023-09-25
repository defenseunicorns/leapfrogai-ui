<script>
    import { writable } from "svelte/store";
    import {
        TrashBinSolid,
        FileEditSolid,
        ArrowRightSolid,
        UserSettingsSolid,
        SunSolid,
        SunOutline,
        EditOutline,
    } from "flowbite-svelte-icons";
    import {
        Listgroup,
        ListgroupItem,
        Label,
        Input,
        Button,
        Heading,
    } from "flowbite-svelte";
    import configs from "../configs.json";
    import { OpenAI } from "openai";

    const openai = new OpenAI({
        apiKey: configs.OPENAI_API_KEY,
        baseURL: configs.OPENAI_API_HOST,
        dangerouslyAllowBrowser: true,
    });

    let conversations = writable([]);
    let prompts = writable([]);
    let showSettings = false;

    function newFolder() {
        folders.update((n) => [...n, "New Folder"]);
    }

    function clearFolders() {
        folders.set([]);
    }

    function newChat() {
        conversations.update((n) => [...n, "New Conversation"]);
    }

    function clearConversations() {
        conversations.set([]);
    }

    function importFiles() {
        // dummy function
    }

    function importData() {
        // dummy function
    }

    function exportData() {
        // dummy function
    }

    function settings() {
        showSettings = !showSettings;
    }

    function pluginKeys() {
        // dummy function
    }

    function newPrompt() {
        showPromptDetails = !showPromptDetails;
    }

    function search() {
        // dummy function
    }

    function createFolder() {
        // dummy function
    }

    function collapsePanel() {
        // dummy function
    }

    // @ts-ignore
    let chatContainer;

    function scrollToBottom() {
        // @ts-ignore
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    let chatMessages = writable([]);
    let model = "";
    let systemPrompt = configs.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT;
    let temperature = 0.5;
    let currentMessage = writable("");
    let showPromptDetails = false;

    // @ts-ignore
    function getMessage(source, text) {
        return { role: source, content: text };
    }

    async function sendMessage() {
        let lastMessage = getMessage("user", $currentMessage);

        if ($currentMessage.trim() !== "") {
            $chatMessages = [...$chatMessages, lastMessage];
            currentMessage.set("");
        }

        let chatCompletion = {
            key: "",
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...$chatMessages,
            ],
            model: model,
            max_tokens: 1000,
            temperature: temperature,
            stream: false,
        };

        const myRequest = new Request("http://localhost:3001/chat-completion", {
            method: "POST",
            body: JSON.stringify(chatCompletion),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${configs.OPENAI_API_KEY}`,
            },
        });

        fetch(myRequest)
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                let newMessage = getMessage(
                    "assistant",
                    data["choices"][0]["message"]["content"]
                );
                if (newMessage.content.trim() !== "") {
                    $chatMessages = [...$chatMessages, newMessage];
                }
            });

        scrollToBottom();
    }

    async function regenerateResponse() {
        // Remove the last assistant message
        $chatMessages = $chatMessages.filter((message, index, self) => {
            return index !== self.length - 1 || message.role !== "assistant";
        });

        // Request a new message
        await sendMessage();
    }

    function savePrompt() {
        // dummy function
    }

    function cancelPrompt() {
        // dummy function
    }

    let folders = writable([]);

    function removeFolder(index) {
        folders.update((folders) => {
            folders.splice(index, 1);
            return folders;
        });
    }

    function removeConversation(index) {
        conversations.update((conversations) => {
            conversations.splice(index, 1);
            return conversations;
        });
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
        tempConversationName = $conversations[index];
    }

    function handleConversationKeyDown(event) {
        if (event.key === "Enter") {
            editConversationName(tempConversationName);
        }
    }

    function editConversationName(newName) {
        conversations.update((conversations) => {
            conversations[editingConversationIndex] = newName;
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
            <button class="btn mb-2" on:click={clearConversations}
                >Clear conversations</button
            >
            <input
                class="input input-bordered w-full max-w-xs mb-2"
                type="text"
                placeholder="Search"
                on:input={search}
            />
            {#if $conversations.length > 0}
                <div class="menu bg-base-200 w-full rounded-box">
                    {#each $conversations as conversation, index}
                        <div class="flex">
                            <button class="btn">{conversation}</button>
                            {#if editingConversationIndex === index}
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
                                        startEditingConversationName(index)}
                                    ><EditOutline /></button
                                >
                            {/if}
                            <button
                                class="btn"
                                on:click={() => removeConversation(index)}
                                ><TrashBinSolid /></button
                            >
                        </div>
                    {/each}
                </div>
            {/if}
            <Heading class="underline-heading"  tag="h4">Folders</Heading>
            <button class="btn mb-2" on:click={newFolder}>New folder</button>
            <button class="btn mb-2" on:click={clearFolders}
                >Clear Folders</button
            >
            {#if $folders.length > 0}
                <div class="menu bg-base-200 w-full rounded-box">
                    {#each $folders as folder, index}
                        <div class="flex">
                            <button class="btn">{folder}</button>
                            {#if editingFolderIndex === index}
                                <input
                                    class="input input-bordered w-full max-w-xs mb-2"
                                    type="text"
                                    bind:value={tempFolderName}
                                    on:keydown={handleKeyDown}
                                    autofocus
                                />
                            {:else}
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
            <Heading class="underline-heading"  tag="h4">Data Management</Heading>
            <button class="btn mb-2" on:click={importFiles}>Import files</button
            >
            <button class="btn mb-2" on:click={importData}>Import data</button>
            <button class="btn mb-2" on:click={exportData}>Export data</button>
            <button class="btn mb-2" on:click={settings}>Settings</button>
            <button class="btn mb-2" on:click={pluginKeys}>Plugin Keys</button>
        </div>

        <!-- Center Panel -->
        <div class="w-3/5 bg-blue-600 p-4 flex flex-col text-white">
            <div
                bind:this={chatContainer}
                class="chat-container mb-2 overflow-auto flex-grow"
            >
                {#each $chatMessages as message}
                    <Label class="message-label">{message.role}</Label>
                    <div
                        class="p-2 m-2 rounded {message.role === 'user'
                            ? 'user-message'
                            : 'assistant-message'} text-black"
                    >
                        {message.content}
                    </div>
                {/each}
            </div>
            {#if showSettings}
                <div class="mb-2">
                    <label for="model">Model:</label>
                    <select id="model" bind:value={model}>
                        <option value="mpt-7b-8k-chat">mpt-7b-8k-chat</option>
                        <option value="Test">Test</option>
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
            {/if}
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
                <button class="btn ml-2 p-2">
                    <ArrowRightSolid />
                </button>
                <button class="btn ml-2 p-2" on:click={settings}>
                    <UserSettingsSolid />
                </button>
            </div>
        </div>

        <!-- Side Panel 2 -->
        <div class="w-1/5 bg-blue-800 p-4 flex flex-col text-white">
            <Heading class="underline-heading" tag="h4">Prompts</Heading>
            <button class="btn mb-2" on:click={newPrompt}>New prompt</button>
            <input
                class="input input-bordered w-full max-w-xs mb-2"
                type="text"
                placeholder="Search"
                on:input={search}
            />
            <div class="mb-2 overflow-auto">
                {#each Array.from($prompts.values()) as prompt}
                    <div>{prompt}</div>
                {/each}
            </div>
            {#if showPromptDetails}
                <h2>Prompt Details</h2>
                <div class="mb-2">
                    <label for="prompt-name">Prompt Name:</label>
                    <input
                        id="prompt-name"
                        type="text"
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <div class="mb-2">
                    <label for="prompt-description">Prompt Description:</label>
                    <input
                        id="prompt-description"
                        type="text"
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <div class="mb-2">
                    <label for="prompt-details">Prompt Details:</label>
                    <input
                        id="prompt-details"
                        type="text"
                        class="input input-bordered w-full max-w-xs mb-2"
                    />
                </div>
                <button class="btn mb-2" on:click={savePrompt}>Save</button>
                <button class="btn mb-2" on:click={cancelPrompt}>Cancel</button>
            {/if}
        </div>
    </div>
</div>

<style lang="postcss">
    :global(html) {
        background-color: #000033; /* dark blue */
    }
    .bg-dark-blue {
        background-color: #000033; /* dark blue */
    }
    .bg-blue-800 {
        background-color: #000080; /* lighter blue */
    }
    .bg-blue-600 {
        background-color: #0000cd; /* even lighter blue */
    }
</style>
