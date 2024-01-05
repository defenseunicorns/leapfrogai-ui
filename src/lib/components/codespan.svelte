<script lang="ts">
    import {HighlightAuto} from "svelte-highlight";
    import github from "svelte-highlight/styles/github-dark";

    export let text: string;
</script>

<svelte:head>
    {@html github}
</svelte:head>

<div class="code-span">
    <HighlightAuto class="p-0" code="{text}"/>
</div>
