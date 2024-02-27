<script lang="ts">
    import "../app.css";
    import { env } from "$env/dynamic/public";

    const branding: Boolean = env.PUBLIC_AI4NS_BRANDING === "true" ? true : false;
</script>

{#if branding}
    <title>AI for National Security</title>
{/if}
{#if !branding}
    <title>LeapfrogAI</title>
{/if}

<div class="flex flex-col h-screen">
    <div class="flex flex-grow">
        <div
            class="w-full pb-4 pt-4 flex flex-col ml-72 mr-72 mt-20 mb-20 justify-center items-center"
        >
            {#if branding}
                <div class="text-5xl font-bold text-center">
                    <p>Welcome to AI for National Security</p>
                </div>
                <div class="justify-center items-center py-4">
                    <img src="server.svg" alt="" />
                </div>
            {/if}
            {#if !branding}
                <div class="text-5xl font-bold text-center">
                    <p>Welcome to LeapfrogAI</p>
                </div>
                <div class="justify-center items-center py-4">
                    F
                    <img src="big-leapfrog.svg" alt="" />
                </div>
            {/if}
            <div class="text-2xl font-bold text-center">
                <p>Created and Maintained by:</p>
            </div>
            <img
                src="defense-unicorns.svg"
                class="h-11"
                alt="Defense Unicorns"
            />
        </div>
    </div>
</div>
