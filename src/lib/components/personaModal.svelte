<script>
  import { writable } from 'svelte/store';
  import { getModels } from '$lib/getModels';
    import { onMount } from 'svelte';

  let personas = writable([]);
  let models = writable([null]);
  let currentPersonaId = 0;

  onMount(async () => {
    models.set(await getModels());
  });

  function updatePersona() {
        personas.update((n) => {
            const persona = n.find((p) => p.id === currentPersonaId);
            if (persona) {
                persona.name = $personas[currentPersonaId].name;
                persona.description = $personas[currentPersonaId].description;
                persona.systemPrompt = $personas[currentPersonaId].systemPrompt;
                persona.temperature = $personas[currentPersonaId].temperature;
                persona.model = $personas[currentPersonaId].model;
            }
            return n;
        });
        document.getElementById("persona_modal")["close"]();
    }
</script>

<form on:submit|preventDefault={updatePersona}>
  <div class="py-4">
      <label for="persona-name">Name:</label>
      <input
          id="persona-name"
          type="text"
          bind:value={$personas[currentPersonaId].name}
          class="input input-bordered w-full max-w-xs mb-2"
      />
  </div>
  <div class="py-4">
      <label for="persona-description">Description:</label>
      <input
          id="persona-description"
          type="text"
          bind:value={$personas[currentPersonaId].description}
          class="input input-bordered w-full max-w-xs mb-2"
      />
  </div>
  <div class="py-4">
      <label for="persona-system-prompt">System Prompt:</label>
      <input
          id="persona-system-prompt"
          type="text"
          bind:value={$personas[currentPersonaId].systemPrompt}
          class="input input-bordered w-full max-w-xs mb-2"
      />
  </div>
  <div class="py-4">
      <label for="persona-temperature">Temperature:</label>
      <input
          id="persona-temperature"
          type="range"
          min="0"
          max="1"
          step="0.01"
          bind:value={$personas[currentPersonaId].temperature}
      />
  </div>
  <div class="py-4">
      <label for="persona-model">Model:</label>
      <select
          id="persona-model"
          bind:value={$personas[currentPersonaId].model}
          class="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52"
      >
          {#each $models as model}
              <option value={model}>{model}</option>
          {/each}
      </select>
  </div>
  <div class="modal-action">
      <button type="submit" class="btn">Save</button>
      <button
          type="button"
          class="btn"
          on:click={() =>
              document.getElementById("persona_modal")["close"]()}
          >Close</button
      >
  </div>
</form>