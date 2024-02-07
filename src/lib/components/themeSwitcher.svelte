<script lang="ts">
  import { onMount } from 'svelte'
  import { themes } from '$lib/themes'

  let current_theme = ''

  onMount(() => {
    if (typeof window !== 'undefined') {
      const theme = window.localStorage.getItem('theme')
      if (theme && themes.includes(theme)) {
        document.documentElement.setAttribute('data-theme', theme)
        current_theme = theme
      }
    }
  })

  function set_theme(event: Event) {
    const select = event.target as HTMLSelectElement
    const theme = select.value
    if (themes.includes(theme)) {
      const one_year = 60 * 60 * 24 * 365
      window.localStorage.setItem('theme', theme)
      document.cookie = `theme=${theme}; max-age=${one_year}; path=/;`
      document.documentElement.setAttribute('data-theme', theme)
      current_theme = theme
    }
  }
</script>

<div>
  <select
    bind:value={current_theme}
    data-choose-theme
    class="select select-bordered select-primary capitalize"
    on:change={set_theme}
  >
    <option value="" disabled={current_theme !== ''}>Choose a theme</option>
    {#each themes as theme}
      <option value={theme} class="capitalize">{theme}</option>
    {/each}
  </select>
</div>