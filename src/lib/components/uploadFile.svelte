<script lang="ts">
    import { UploadOutline } from 'flowbite-svelte-icons'

    let files = [] // Store multiple files
    let message = ''
    const authorizedExtensions = ['.txt', '.pdf']

    async function handleUpload(event) {
        event.preventDefault()
        if (files.length === 0) {
            message = 'Please select one or more files before submitting.'
            return
        }

        // Loop through the files and upload each one individually
        for (const file of files) {
            const formData = new FormData()
            formData.append('file', file)

            try {
                const uploadResponse = await fetch('/api/rag/upload', {
                    method: 'POST',
                    body: formData
                })

                if (!uploadResponse.ok) {
                    throw new Error(`File upload failed for ${file.name}`)
                }

                message += `File ${file.name} uploaded successfully!\n`
            } catch (error) {
                message += `${error.message}\n`
            }
        }
    }

    function handleFileChange(event) {
        files = Array.from(event.target.files).filter(
            (file: File) => file.type === 'text/plain' || file.type === 'application/pdf'
        )

        if (files.length !== event.target.files.length) {
            message = 'Only .txt and .pdf files are allowed.'
        } else {
            message = ''
        }
    }
</script>

<form on:submit={handleUpload}>
    <div class="flex flex-row gap-2">
        <input
            name="upload-box"
            accept={authorizedExtensions.join(',')}
            required
            type="file"
            multiple
            class="file-input file-input-primary file-input-lg w-full"
            on:change={handleFileChange}
        />

        <button disabled={files.length === 0} type="submit" class="btn btn-primary btn-outline h-auto">
            Upload <UploadOutline />
        </button>
    </div>
    {#if message}
        <div>
            <p class="message">
                {message
                    .split('\n')
                    .map((line) => `${line}\n`)
                    .join('')}
            </p>
        </div>
    {/if}
</form>
