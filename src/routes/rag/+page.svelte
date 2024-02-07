<script lang="ts">
    import RagPicker from "$lib/components/ragPicker.svelte";
    import UploadFile from "$lib/components/uploadFile.svelte";
    import {urlConcat} from "$lib/helper";
    import {CompressOutline} from "flowbite-svelte-icons";
    import {onMount} from "svelte";

    let queryInput = ""; // To store the user input for querying
    let queryResult = ""; // To store the result of the query

    async function handleQuery() {
        try {
            queryResult = await queryRag(queryInput); // Set the query result to be displayed
            queryInput = ""
        } catch (error) {
            queryResult = error.message;
        }
    }

    async function handleSubmitQuery(event: KeyboardEvent) {
        if (event.key === "Enter") {
            await handleQuery()
        }
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

    onMount(() => {
        // Additional initialization if needed
    });
</script>

<div class="flex flex-col h-screen">
    <div class="flex flex-grow">
        <div class="w-full pb-4 pt-4 flex flex-col ml-72 mr-72 mt-24 mb-20">
            <UploadFile/>
            <RagPicker/>
            <span class="whitespace-nowrap">
                <input
                        class="input input-bordered mb-2 w-10/12"
                        type="text"
                        bind:value={queryInput}
                        on:keypress={handleSubmitQuery}
                        placeholder="Enter your query here"
                />
                <button
                        disabled={!queryInput}
                        on:click={handleQuery}
                        class="btn btn-primary btn-outline h-auto w-2/12"
                >Query <CompressOutline/>
                </button>
            </span>
            <p class="message">Query Result: {queryResult}</p>
        </div>
    </div>
</div>
