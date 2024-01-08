<script lang="ts">
    import {SunSolid, SunOutline} from "flowbite-svelte-icons";

    function toggleTheme() {
        const html = document.querySelector('html');
        html.classList.toggle('dark');
    }
</script>


<label class="swap swap-rotate" on:change={toggleTheme}>
    <!-- this hidden checkbox controls the state -->
    <input type="checkbox" class="invisible" />

    <SunSolid class="swap-on" />
    <SunOutline class="swap-off" />
</label>