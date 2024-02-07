<script lang="ts">

    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { urlConcat } from "$lib/helper";
    import PersonaPicker from "$lib/components/personaPicker.svelte";
    import settings from '$lib/settings';
    import type {ModelSettings} from '$lib/settings'
    import { PUBLIC_TRANSCRIPTION_MODEL } from "$env/static/public";
    import ChatPicker from "$lib/components/chatPicker.svelte";
    import ChatPanel from "$lib/components/chatPanel.svelte";

    let conversations = writable([]);
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

    let currentConversationId = writable(null);

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
</script>

<svelte:head>
    <title>Chat</title>
</svelte:head>

<div class="flex flex-col h-screen">
    <div class="flex flex-grow">
        <!-- Side Panel 1 -->
        <ChatPicker bind:curConversationId={currentConversationId} bind:conversations={conversations}/>
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

        <!-- Center Panel -->
        <ChatPanel settings={currentSettings} bind:curConversationId={currentConversationId} bind:conversations={conversations}/>

        <!-- Side Panel 2 -->
        <PersonaPicker bind:pickedPersona={currentSettings}/>
    </div>
</div>
