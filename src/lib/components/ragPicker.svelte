<script lang="ts">
    import { TrashBinOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import {newChat, urlConcat} from "$lib/helper";

    export let currentDocumentId = writable(null);
    export let documents = writable([]);

    let conversationSearch = "";

    function removeConversation(id: string) {
        documents.update((n) => n.filter((c) => c.id !== id));
    }

    async function loadDocuments() {

        try {
            return fetch(urlConcat("/api/rag/list/"), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }).then((response) => {
                return response.json();
            });
        } catch (error) {
            console.error(error);
        }
    }

    onMount(async () => {
        let documents = await loadDocuments()
        let documentMap = documents as Map<string, string>
        console.log(documentMap)
    })
</script>

<input
    class="input input-bordered w-full mb-2"
    type="text"
    placeholder="Search"
    bind:value={conversationSearch}
/>
{#if $documents.length > 0}
    <div class="menu">
        {#each $documents as conversation}
            {#if conversationSearch == "" || conversation.name
                    .toLowerCase()
                    .includes(conversationSearch.toLowerCase())}
                <div
                    class="my-1 flex ml-1 flex-row w-full content-center"
                >
                    <li class="w-11/12 flex-nowrap">
                        <button
                            class="whitespace-nowrap
                            {conversation.id === $currentDocumentId
                                ? 'outline outline-2 outline-offset-2 outline-secondary'
                                : ''}"
                            on:click={async () => {
                                currentDocumentId.set(
                                    conversation.id,
                                );
                            }}
                        >
                            <span class="overflow-hidden"
                                >{conversation.name}</span
                            >
                        </button>
                    </li>
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
