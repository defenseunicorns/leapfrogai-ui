<script lang="ts">
    import RagPicker from "$lib/components/ragPicker.svelte";
    import UploadFile from "$lib/components/uploadFile.svelte";
    import { urlConcat } from "$lib/helper";
    import { UploadOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";

    let file;
    let message = "";
    let queryInput = ""; // To store the user input for querying
    let queryResult = ""; // To store the result of the query

    const authorizedExtensions = [".txt", ".pdf"];

    async function handleQuery() {
        if (!queryInput.trim()) {
            message = "Please enter a query.";
            return;
        }

        try {
            const queryResponse = await queryRag(queryInput);
            queryResult = queryResponse; // Set the query result to be displayed
            console.log("Query Response" + queryResult);
        } catch (error) {
            message = error.message;
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
            <UploadFile />
            <RagPicker />
            <div>
                <input
                    type="text"
                    bind:value={queryInput}
                    placeholder="Enter your query here"
                />
                <button on:click={handleQuery}>Query</button>
                <p class="message">Query Result: {queryResult}</p>
            </div>
        </div>
    </div>
</div>
