<script lang="ts">
    import { ArrowRightSolid, RotateOutline } from "flowbite-svelte-icons";
    import SvelteMarkdown from "svelte-markdown";
    import codeblock from "$lib/components/codeblock.svelte";
    import codespan from "$lib/components/codespan.svelte";
    import { writable } from "svelte/store";
    import { urlConcat } from "$lib/helper";
    import { onMount } from "svelte";

    export let conversation = writable(null);
    export let settings: Agent;

    let ragEndpointActive = false;
    let ragEnabled = false;

    let chatContainer;

    onMount(async () => {
        await updateRagEndpointState();
    });

    function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    let currentMessage = writable("");

    function getMessage(source, text) {
        return { role: source, content: text };
    }

    async function sendMessage() {
        let lastMessage = getMessage("user", $currentMessage);

        if ($currentMessage.trim() !== "") {
            $conversation.messages.push(lastMessage);
            currentMessage.set("");
        }

        /* Copy the current messages into a new array so that the RAG results can be
            inserted without changing what the user sees. */
        let conversationMessages = $conversation.messages;

        // Only use RAG if the server is available and if the user has it enabled
        if (ragEndpointActive && ragEnabled) {
            // Construct the RAG message that will be inserted before the user's message
            let ragResponse = {
                role: "system",
                content: await queryRag(lastMessage.content),
            };

            // Insert the RAG message before the user's message
            conversationMessages.splice(
                conversationMessages.length - 1,
                0,
                ragResponse,
            );
        }

        // Payload to send to the local chat-completion endpoint
        let chatCompletion = {
            key: "",
            messages: [
                {
                    role: "system",
                    content: settings.systemPrompt,
                },
                ...conversationMessages,
            ],
            model: settings.model,
            max_tokens: 1000,
            temperature: settings.temperature,
        };

        // Create a new assistant message with empty content
        let newMessage = getMessage("assistant", "");
        $conversation.messages.push(newMessage);

        // Request is sent to the local-chat completion server, then routed to the real endpoint
        const myRequest = new Request(urlConcat("/api/chat-completion"), {
            method: "POST",
            body: JSON.stringify(chatCompletion),
            headers: {
                "Content-Type": "application/json",
            },
        });

        fetch(myRequest)
            .then((response) => response.body)
            .then((body) => {
                const reader = body.getReader();
                return new ReadableStream({
                    start(controller) {
                        return pump();
                        function pump() {
                            return reader.read().then(({ done, value }) => {
                                // When no more data needs to be consumed, close the stream
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                // Enqueue the next data chunk into our target stream
                                controller.enqueue(value);
                                const textValue = new TextDecoder().decode(
                                    value,
                                );
                                newMessage.content += textValue;
                                scrollToBottom();
                                return pump();
                            });
                        }
                    },
                });
            });
    }

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
</script>

<div class="w-full pb-4 pt-4 flex flex-col ml-72 mr-72 mt-20 mb-20 overflow-x-scroll">
    {#if $conversation !== null}
        <div
            bind:this={chatContainer}
            class="chat-container overflow-auto flex-grow"
        >
        
                {#each $conversation.messages as message}
                    <div class="chat-header">{message.role}</div>
                    <div
                        class="p-2 m-2 rounded {message.role === 'user'
                            ? 'user-message'
                            : 'assistant-message'}"
                    >
                        <SvelteMarkdown
                            on:parsed={() => scrollToBottom()}
                            source={message.content}
                            renderers={{
                                code: codeblock,
                                codespan: codespan,
                            }}
                        />
                    </div>
                {/each}
        </div>
    {/if}

    <div
        class="fixed right-72 left-72 bottom-0 flex items-center p-4 bg-base-100"
    >
        <div class="mb-2 flex w-full items-center">
            <form
                on:submit|preventDefault={sendMessage}
                class="flex-grow items-center"
            >
                <input
                    type="text"
                    placeholder="Type your message here..."
                    bind:value={$currentMessage}
                    class="input input-bordered w-full"
                />
            </form>
            <button on:click={sendMessage} class="btn ml-2 p-2"
                ><ArrowRightSolid /></button
            >
        </div>
    </div>
</div>
