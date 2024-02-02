<script lang="ts">
    import { urlConcat } from "$lib/helper";
    import { UploadOutline } from "flowbite-svelte-icons";
    import { onMount } from "svelte";

    let file;
    let message = "";
    let queryInput = ""; // To store the user input for querying
    let queryResult = ""; // To store the result of the query

    const authorizedExtensions = [".txt", ".pdf"];

    async function handleUpload(event) {
        event.preventDefault();
        if (!file) {
            message = "Please select a file before submitting.";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadResponse = await fetch("/api/rag/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error("File upload failed");
            }

            message = "File uploaded successfully!";
        } catch (error) {
            message = error.message;
        }
    }

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

    function handleFileChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            const selectedFile = files[0];
            if (
                selectedFile.type === "text/plain" ||
                selectedFile.type === "application/pdf"
            ) {
                message = "";
                file = selectedFile;
            } else {
                message = "Please upload only .txt or .pdf files.";
            }
        }
    }

    onMount(() => {
        // Additional initialization if needed
    });
</script>

<div class="flex flex-col h-screen">
    <div class="flex flex-grow">
        <div class="w-full pb-4 pt-4 flex flex-col ml-72 mr-72 mt-24 mb-20">
            <form on:submit={handleUpload}>
                <div class="flex flex-row gap-2">
                    <input
                        name="upload-box"
                        accept={authorizedExtensions.join(",")}
                        required
                        type="file"
                        class="file-input file-input-primary file-input-lg w-full"
                        on:change={handleFileChange}
                    />

                    <button
                        disabled={!file}
                        type="submit"
                        class="btn btn-primary btn-outline h-auto"
                        >Upload <UploadOutline />
                    </button>
                </div>
                {#if message}
                    <p class="message">{message}</p>
                {/if}
            </form>

            <input
                type="text"
                bind:value={queryInput}
                placeholder="Enter your query here"
            />
            <button on:click={handleQuery}>Query</button>

            <!-- {#if queryResult} -->
            <p class="message">Query Result: {queryResult}</p>
            <!-- {/if} -->
        </div>
    </div>
</div>
