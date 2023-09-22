<script>
    import { writable } from "svelte/store";
    import {
        ArrowRightSolid,
        UserSettingsSolid,
        SunSolid,
        SunOutline,
    } from "flowbite-svelte-icons";
    import { Listgroup, ListgroupItem, Label, Input } from "flowbite-svelte";
    import configs from "../../configs.json";
    import { OpenAI } from "openai";

    const openai = new OpenAI({
        apiKey: configs.OPENAI_API_KEY,
    });

    let conversations = writable([]);
    let prompts = writable([]);
    let showSettings = false;

    function newChat() {
        $conversations.push("New");
    }

    function newFolder() {
        // dummy function
    }

    function clearConversations() {
        // dummy function
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
        // dummy function
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

    let chatMessages = writable([]);
    let model = "";
    let systemPrompt = "";
    let temperature = 0;
    let currentMessage = writable("");

    function sendMessage() {
        if ($currentMessage.trim() !== "") {
            $chatMessages = [...$chatMessages, $currentMessage];
            currentMessage.set("");
        }
    }

    function regenerateResponse() {
        // dummy function
    }

    function savePrompt() {
        // dummy function
    }

    function cancelPrompt() {
        // dummy function
    }

    let folders = writable([]);

    function addFolder() {
        // dummy function
    }

    function removeFolder() {
        // dummy function
    }

    function editFolderName() {
        // dummy function
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
            <h2>Conversations</h2>
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
            <div class="mb-2 overflow-auto">
                {#each $conversations as conversation}
                    <div>{conversation}</div>
                {/each}
            </div>
            <h2>Folders</h2>
            <button class="btn mb-2" on:click={newFolder}>New folder</button>
            <button class="btn mb-2" on:click={addFolder}>Add Folder</button>
            <div class="mb-2 overflow-auto">
                {#each Array.from($folders.values()) as folder}
                    <div>
                        {folder}
                        <button class="btn" on:click={removeFolder}
                            >Remove</button
                        >
                        <button class="btn" on:click={editFolderName}
                            >Edit Name</button
                        >
                    </div>
                {/each}
            </div>
            <h2>Data Management</h2>
            <button class="btn mb-2" on:click={importFiles}>Import files</button
            >
            <button class="btn mb-2" on:click={importData}>Import data</button>
            <button class="btn mb-2" on:click={exportData}>Export data</button>
            <button class="btn mb-2" on:click={settings}>Settings</button>
            <button class="btn mb-2" on:click={pluginKeys}>Plugin Keys</button>
        </div>

        <!-- Center Panel -->
        <div class="w-3/5 bg-blue-600 p-4 flex flex-col text-white">
            <div class="mb-2 overflow-auto flex-grow">
                {#each $chatMessages as message}
                    <div class="p-2 m-2 bg-white text-black rounded">
                        {message}
                    </div>
                {/each}
            </div>
            {#if showSettings}
                <div class="mb-2">
                    <label for="model">Model:</label>
                    <select id="model" bind:value={model}>
                        <!-- Add options here -->
                    </select>
                </div>
                <div class="mb-2">
                    <label for="system-prompt">System Prompt:</label>
                    <input
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
            <form
                on:submit|preventDefault={sendMessage}
                class="mb-2 flex items-center"
            >
                <Input
                    id="small-input"
                    size="sm"
                    placeholder="Type your message here..."
                    bind:value={$currentMessage}
                    class="flex p-2"
                />
                <button class="btn ml-2 p-2" on:click={sendMessage}>
                    <ArrowRightSolid />
                </button>
                <button class="btn ml-2 p-2" on:click={settings}>
                    <UserSettingsSolid />
                </button>
            </form>
        </div>

        <!-- Side Panel 2 -->
        <div class="w-1/5 bg-blue-800 p-4 flex flex-col text-white">
            <h2>Prompts</h2>
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
