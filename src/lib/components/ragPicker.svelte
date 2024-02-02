<script lang="ts">
    import { TrashBinOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { newChat } from "$lib/helper";

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
</script>

<!-- <div class="w-full p-4 pb-60 h-full fixed top-20 left-0"> -->
    <!-- <div class="w-full pb-96 h-full fixed top-52 overflow-y-auto"> -->
        <input
            class="input input-bordered w-full mb-2"
            type="text"
            placeholder="Search"
            bind:value={conversationSearch}
        />
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
                                <li class="w-11/12 flex-nowrap">
                                    <button
                                        class="whitespace-nowrap
                                        {conversation.id === $curConversationId
                                            ? 'outline outline-2 outline-offset-2 outline-secondary'
                                            : ''}"
                                        on:click={async () => {
                                            curConversationId.set(
                                                conversation.id,
                                            );
                                        }}
                                    >
                                        <span class="overflow-hidden"
                                            >{conversation.name}</span
                                        >
                                    </button>
                                </li>
                            {/if}
                            <button
                                class="btn-ghost px-2"
                                on:click={() =>
                                    removeConversation(conversation.id)}
                                ><TrashBinOutline /></button
                            >
                        </div>
                    {/if}
                {/each}
            </div>
        {/if}
    <!-- </div> -->
