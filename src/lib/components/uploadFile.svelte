<script lang="ts">
    import { UploadOutline } from "flowbite-svelte-icons";

    let file;
    let message = "";
    const authorizedExtensions = [".txt", ".pdf"];

    async function handleUpload(event) {
        event.preventDefault();
        if (!file) {
            message = "Please select a file before submitting.";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const uploadResponse = await fetch("/api/rag/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error("File upload failed");
            }

            message = "File uploaded successfully!";
        } catch (error) {
            message = error.message;
        }
    }

    function handleFileChange(event) {
        const files = event.target.files;
        if (files.length > 0) {
            const selectedFile = files[0];
            if (
                selectedFile.type === "text/plain" ||
                selectedFile.type === "application/pdf"
            ) {
                message = "";
                file = selectedFile;
            } else {
                message = "Please upload only .txt or .pdf files.";
            }
        }
    }
</script>

<form on:submit={handleUpload}>
    <div class="flex flex-row gap-2">
        <input
            name="upload-box"
            accept={authorizedExtensions.join(",")}
            required
            type="file"
            class="file-input file-input-primary file-input-lg w-full"
            on:change={handleFileChange}
        />

        <button
            disabled={!file}
            type="submit"
            class="btn btn-primary btn-outline h-auto"
            >Upload <UploadOutline />
        </button>
    </div>
    {#if message}
        <p class="message">{message}</p>
    {/if}
</form>
