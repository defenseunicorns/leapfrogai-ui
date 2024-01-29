<script lang="ts">
	import { EditOutline, PlusOutline, TrashBinOutline } from 'flowbite-svelte-icons';
	import { env } from '$env/dynamic/public';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import ModelPicker from './modelPicker.svelte';

	export let pickedPersona: Agent;

	let localStorage: Storage;
	let personas = writable([]);

	let personaSearchQuery = '';

	let defaultSettings: Agent = {
		uuid: uuidv4(),
		name: 'New Persona',
		description: '',
		model: env.PUBLIC_DEFAULT_MODEL,
		url: env.PUBLIC_OPENAI_API_HOST,
		type: 'Chat',
		systemPrompt: env.PUBLIC_DEFAULT_SYSTEM_PROMPT,
		temperature: Number(env.PUBLIC_DEFAULT_TEMPERATURE)
	};

	onMount(() => {
		localStorage = window.localStorage;
		getLocalPersonas();
	});

	function getLocalPersonas() {
		if (localStorage) {
			const storedPersonas = JSON.parse(localStorage.getItem('personas'));
			if (storedPersonas?.length > 0) {
				personas.set(storedPersonas);
			}
		}

		if ($personas.length === 0) {
			personas.set([defaultSettings]);
		}

		pickedPersona = $personas[0];
	}

	function persistPersonas(value: any[]) {
		if (localStorage) {
			localStorage.setItem('personas', JSON.stringify(value));
		}
	}

	personas.subscribe(persistPersonas);

	function newPersona() {
		defaultSettings.uuid = uuidv4();
		personas.update((n: any[]) => [
			...n,
			{
				...defaultSettings
			}
		]);
		editPersona(defaultSettings.uuid);
	}

	function applyPersona(persona: any) {
		pickedPersona = persona;
	}

	function removePersona(id: any) {
		personas.update((n: any[]) => n.filter((p) => p.uuid !== id));
	}

	let tmpNewPersona = defaultSettings;
	function editPersona(id: any) {
		const persona = $personas.find((p) => p.uuid === id);
		tmpNewPersona = { ...persona };
		document.getElementById('persona_modal')['showModal']();
	}
	function updatePersona(id: any) {
		personas.update((n) => {
			return n.map((p) => {
				if (p.uuid === id) {
					// Return a new object with the updated properties
					return {
						...p,
						name: tmpNewPersona.name,
						description: tmpNewPersona.description,
						model: tmpNewPersona.model,
						url: tmpNewPersona.url,
						type: tmpNewPersona.type,
						systemPrompt: tmpNewPersona.systemPrompt,
						temperature: tmpNewPersona.temperature
					};
				}
				return p; // Return the original object for other personas
			});
		});
		document.getElementById('persona_modal')['close']();
	}
</script>

<div class="w-72 p-4 h-full fixed top-20 right-0 overflow-y-auto">
	<button
		class="btn w-full mb-2 justify-between"
		on:click={() => {
			newPersona();
		}}
		>New Persona <PlusOutline />
	</button>
	<input
		class="input input-bordered w-full mb-2"
		type="text"
		placeholder="Search"
		bind:value={personaSearchQuery}
	/>
	{#each $personas as persona}
		{#if personaSearchQuery == '' || persona.name
				.toLowerCase()
				.includes(personaSearchQuery.toLowerCase())}
			<div class="menu bg-base-100 w-full rounded-box">
				<div class="flex">
					<li class="w-4/6 flex-nowrap">
						<button
							class="whitespace-nowrap"
							on:click={() => {
								applyPersona(persona);
							}}>{persona.name}</button
						>
					</li>
					<button
						class="btn-ghost w-1/6 px-2"
						on:click={() => {
							editPersona(persona.uuid);
						}}><EditOutline /></button
					>
					<button
						class="btn-ghost w-1/6 px-2"
						on:click={() => {
							removePersona(persona.uuid);
						}}><TrashBinOutline /></button
					>
				</div>
			</div>
		{/if}
	{/each}
</div>

{#if $personas.length > 0}
	<dialog id="persona_modal" class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">
				{tmpNewPersona.name}
			</h3>
			<form on:submit|preventDefault={() => updatePersona(tmpNewPersona.uuid)}>
				<div class="py-2">
					<label for="persona-name">Name:</label>
					<input
						id="persona-name"
						type="text"
						bind:value={tmpNewPersona.name}
						class="input input-bordered w-full max-w-xs mb-2"
					/>
				</div>
				<div class="py-2">
					<label for="persona-description">Description:</label>
					<input
						id="persona-description"
						type="text"
						bind:value={tmpNewPersona.description}
						class="input input-bordered w-full max-w-xs mb-2"
					/>
				</div>
				<div class="py-2">
					<ModelPicker bind:selectedModel={tmpNewPersona.model} />
				</div>
				<div class="py-2">
					<label for="persona-url">URL:</label>
					<input
						id="persona-url"
						type="text"
						bind:value={tmpNewPersona.url}
						class="input input-bordered w-full max-w-xs mb-2"
					/>
				</div>
				<div class="py-2">
					<label for="persona-type">Type:</label>
					<input
						id="persona-type"
						type="text"
						bind:value={tmpNewPersona.type}
						class="input input-bordered w-full max-w-xs mb-2"
					/>
				</div>
				<div class="py-2">
					<label for="persona-system-prompt">System Prompt:</label>
					<input
						id="persona-system-prompt"
						type="text"
						bind:value={tmpNewPersona.systemPrompt}
						class="input input-bordered w-full max-w-xs mb-2"
					/>
				</div>
				<div class="py-2">
					<label for="persona-temperature">Temperature:</label>
					<input
						id="persona-temperature"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={tmpNewPersona.temperature}
					/>
				</div>
				<div class="modal-action">
					<button type="submit" class="btn">Save</button>
					<button
						type="button"
						class="btn"
						on:click={() => {
							document.getElementById('persona_modal')['close']();
						}}>Cancel</button
					>
				</div>
			</form>
		</div>
	</dialog>
{/if}
