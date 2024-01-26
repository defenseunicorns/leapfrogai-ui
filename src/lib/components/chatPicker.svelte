<script lang="ts">
    import {
        EditOutline,
        FileExportOutline,
        FileImportOutline,
        PlusOutline,
        TrashBinOutline,
    } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import {newChat} from "$lib/helper";

    export let curConversationId = writable(null);
    export let conversations = writable([]);

    let editingConversationIndex = -1;
    let tempConversationName = "";
    let conversationSearch = "";
    let chatUuid: string;
    let fileInput;

    let localStorage: Storage;

    onMount(async () => {
        // required to access localStorage after mount
        localStorage = window.localStorage;
        getLocalConversations();
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

    function persistConversations(value: any[]) {
        if (localStorage) {
            localStorage.setItem("conversations", JSON.stringify(value));
        }
    }

    conversations.subscribe(persistConversations);

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

    function editConversation(conversationId: number) {
        if (editingConversationIndex === conversationId) {
            editConversationName(tempConversationName);
        } else {
            startEditingConversationName(conversationId);
        }
    }

    function removeConversation(id: string) {
        conversations.update((n) => n.filter((c) => c.id !== id));
        let isCurrentConversationDeleted =
            $conversations.length > 0 && id == $curConversationId;
        if (isCurrentConversationDeleted) {
            switchToLastConversation();
        }
    }

    function switchToLastConversation() {
        $curConversationId = $conversations[$conversations.length - 1].id;
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
</script>

<div class="w-72 p-4 pb-60 h-full fixed top-20 left-0">
    <button class="btn mb-2 w-full justify-between" on:click={() => newChat(curConversationId, conversations)}>
        New chat
        <PlusOutline />
    </button>
    <input
        class="input input-bordered w-full mb-2"
        type="text"
        placeholder="Search"
        bind:value={conversationSearch}
    />
    <div class="w-[268px] pb-96 h-full fixed top-52 left-0 overflow-y-auto">
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
                                        on:click={async () => {
                                            curConversationId.set(
                                                conversation.id,
                                            )}}
                                    >
                                        <span class="overflow-hidden"
                                            >{conversation.name}</span
                                        >
                                    </button>
                                </li>
                            {/if}
                            <button
                                class="btn-ghost w-1/6 px-2.5"
                                on:click={() =>
                                    editConversation(conversation.id)}
                                ><EditOutline />
                            </button>
                            <button
                                class="btn-ghost w-1/6 px-2"
                                on:click={() =>
                                    removeConversation(conversation.id)}
                                ><TrashBinOutline /></button
                            >
                        </div>
                    {/if}
                {/each}
            </div>
        {/if}
    </div>
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
