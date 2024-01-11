<script lang="ts">
    import LeftPanel from "$lib/components/leftPanel.svelte";
    import RightPanel from "$lib/components/rightPanel.svelte";
    import Transcribe from "$lib/components/transcribe.svelte";
</script>

<LeftPanel objectName="Transcript" />
<Transcribe />
<RightPanel />