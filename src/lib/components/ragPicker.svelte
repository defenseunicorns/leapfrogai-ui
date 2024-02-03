<script lang="ts">
    import {TrashBinOutline} from "flowbite-svelte-icons";
    import {onMount} from "svelte";
    import {writable} from "svelte/store";
    import {newChat, urlConcat} from "$lib/helper";

    const REFRESH_INTERVAL_MS = 2000;
    export let currentDocumentId = writable<string>("");
    export let documents = writable<DocumentMetadata[]>([]);

    let documentSearch = "";

    function removeDocument(id: string) {
        try {
            fetch(urlConcat("/api/rag/delete/"), {
                method: "POST",
                body: JSON.stringify({
                    input: id
                }),
            });
        } catch
            (error) {
            console.error(error);
        }
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

    async function updateDocuments() {
        documents.set(await loadDocuments())
    }

    onMount(async () => {
        await updateDocuments()
        setInterval(() => {updateDocuments()}, REFRESH_INTERVAL_MS)
    })
</script>

<input
        class="input input-bordered w-full mb-2 mt-2"
        type="text"
        placeholder="Search"
        bind:value={documentSearch}
/>
{#if $documents.length > 0}
    <div class="menu">
        {#each $documents as document}
            {#if documentSearch === "" || document.source
                .toLowerCase()
                .includes(documentSearch.toLowerCase())}
                <div
                        class="my-1 flex ml-1 flex-row w-full content-center"
                >
                    <li class="w-11/12 flex-nowrap">
                        <span class="overflow-hidden">{document.source}</span>
                    </li>
                    <button
                            class="btn-ghost px-2"
                            on:mouseover={() => {
                                currentDocumentId.set(
                                    document.uuid,
                                );
                            }}
                            on:focus={onfocus}
                            on:click={() =>
                            removeDocument($currentDocumentId)}
                    >
                        <TrashBinOutline/>
                    </button
                    >
                </div>
            {/if}
        {/each}
    </div>
{/if}
