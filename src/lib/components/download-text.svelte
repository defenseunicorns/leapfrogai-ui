<script lang="ts">
    export let title: string, content: string, name: string;
    import { ArrowDownOutline } from "flowbite-svelte-icons";

    let href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
  </script>

  <a {href} download={name} class="btn btn-outline ml-2" role="button">
    {title}
    <ArrowDownOutline />
  </a
  >
