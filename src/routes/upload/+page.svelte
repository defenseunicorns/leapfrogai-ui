<script lang="ts">
	import { enhance } from '$app/forms';
	import DownloadText from '$lib/components/download-text.svelte';
	import { slide, fly } from 'svelte/transition';
	import { minutesElapsed } from '$lib/helper';

	export let form;

	let uploading = false;
	let summarizing = false;

	let transcriptionTimerStart: number;
	let transcriptionTimerEnd: number;
	let summarizationTimerStart: number;
	let summarizationTimerEnd: number;

	let formRef: HTMLFormElement;
	let dialogRef: HTMLDialogElement;

	let selectedTab = 'transcript';

	let err: Error | null = null;

	const authorizedExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
	let filename = '';
	const upload = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (!target.files) return;
		const file = target.files[0];
		if (!file) return;
		filename = file.name;
	};

	let transcript = '';

	function getTranscriptionRequest() {
		return {
			method: 'POST',
			body: JSON.stringify({ uid: form?.upload?.uid }),
			headers: new Headers({
				'Content-Type': 'application/json; charset=UTF-8'
			})
		};
	}

	function retrieveTranscription(uid: string | File | undefined) {
		if (uid !== undefined && uid !== '') {
			fetch('/transcription', getTranscriptionRequest()).then(async function (value: Response) {
				let json = await value.json();

				if (json.result === 'Complete') {
					transcript = json.transcription;
					uploading = false;
					transcriptionTimerEnd = Date.now();
					return;
				}
			});
		}

		if (uploading) {
			setTimeout(retrieveTranscription, 5000, uid);
		}
	}
	$: retrieveTranscription(form?.upload?.uid);

	$: showTranscript = !uploading && form && form.upload && form.upload.success;
	$: showSummary = !summarizing && form && form.summarize && form.summarize.success;

	$: name = form?.upload?.filename;
	$: summary = form?.summarize?.summary;
</script>

<svelte:head>
	<title>Transcribe / Summary</title>
</svelte:head>

<div class="flex flex-col h-screen">
	<div class="flex flex-grow">
		<div class="w-full pb-4 pt-4 flex flex-col ml-72 mr-72 mt-20 mb-20">
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<dialog
				bind:this={dialogRef}
				class="modal"
				on:keydown={(event) => {
					if (event.key === 'Escape') {
						formRef.reset();
						err = null;
					}
				}}
			>
				<form
					method="dialog"
					class="modal-box"
					on:submit={() => {
						formRef.reset();
						err = null;
					}}
				>
					<h3 class="font-bold text-lg">Uh Oh!</h3>
					<p class="py-4">{err?.message}</p>
					<div class="modal-action">
						<button class="btn">Close</button>
					</div>
				</form>
			</dialog>

			{#if uploading}
				<div class="hero min-h-screen -mt-20">
					<div class="hero-content flex flex-col prose">
						<span class="loading loading-infinity w-40" />
						<span class="uppercase text-2xl">processing "{filename.trim()}"</span>
					</div>
				</div>
			{:else}
				<section class="py-3">
					<form
						method="POST"
						use:enhance={() => {
							uploading = true;
							return async ({ update }) => {
								await update();
							};
						}}
						enctype="multipart/form-data"
						class="flex flex-col gap-4"
						action="?/upload"
						bind:this={formRef}
					>
						<div class="flex flex-row gap-2">
							<input
								name="audioUpload"
								accept={authorizedExtensions.join(',')}
								required
								type="file"
								class="file-input file-input-primary file-input-lg w-full"
								on:input={upload}
							/>
							<button
								disabled={uploading}
								on:click={() => (transcriptionTimerStart = Date.now())}
								type="submit"
								class="btn btn-primary btn-outline h-auto"
								>Upload <svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="w-6 h-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
									/>
								</svg>
							</button>
						</div>
					</form>
				</section>

				{#if showTranscript}
					<section in:slide class="prose max-w-none py-3">
						{#if selectedTab === 'transcript'}
							<code
								>Transcription took {minutesElapsed(transcriptionTimerStart, transcriptionTimerEnd)}
								minutes</code
							>
						{:else if summary}
							<code
								>Summarization took {minutesElapsed(summarizationTimerStart, summarizationTimerEnd)}
								minutes</code
							>
						{/if}
						<blockquote>"{filename}"</blockquote>

						{#if showSummary || summarizing}
							<div class="flex w-full m-auto justify-center">
								<div class="tabs tabs-boxed">
									<button
										on:click={() => (selectedTab = 'transcript')}
										class={`tab text-lg ${selectedTab === 'transcript' ? 'tab-active' : ''}`}
										>Transcript</button
									>
									<button
										on:click={() => (selectedTab = 'summary')}
										class={`tab text-lg ${selectedTab === 'summary' ? 'tab-active' : ''}`}
										>Summary</button
									>
								</div>
							</div>
						{/if}

						<div class="pt-8">
							{#if selectedTab === 'transcript'}
								<DownloadText
									title="Download Transcript"
									content={String(transcript)}
									name={name + '-transcript.txt'}
								/>
							{:else if selectedTab === 'summary' && summary}
								<DownloadText
									title="Download Summary"
									content={summary}
									name={name + '-summary.txt'}
								/>
							{/if}
						</div>

						<div class="pt-1 px-1 rounded-lg my-4 mb-20">
							{#if summarizing}
								<progress class="progress" />
							{/if}
							{#if selectedTab === 'transcript'}
								{transcript}
							{:else if selectedTab === 'summary' && summary}
								<p class="whitespace-pre-line">
									{summary}
								</p>
							{:else}
								{''}
							{/if}
						</div>

						{#if showTranscript && !showSummary}
							<form
								in:fly
								method="POST"
								action="?/summarize"
								use:enhance={() => {
									summarizing = true;
									return async ({ update }) => {
										await update();
										summarizing = false;
										summarizationTimerEnd = Date.now();
									};
								}}
							>
								<input type="hidden" name="filename" value={form?.upload?.filename} />
								<input type="hidden" name="uid" value={form?.upload?.uid} />
								<button
									on:click={() => {
										selectedTab = 'summary';
										summarizationTimerStart = Date.now();
									}}
									type="submit"
									name="submit"
									class="toast btn-accent btn mr-8 mb-20">Summarize?</button
								>
							</form>
						{/if}
					</section>
				{/if}
			{/if}
		</div>
	</div>
</div>
