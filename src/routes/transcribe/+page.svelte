<script lang="ts">
    import { v4 as uuidv4 } from "uuid";
    import {
        EditOutline,
        PlusOutline,
        TrashBinOutline,
    } from "flowbite-svelte-icons";
    import { writable } from "svelte/store";
    import { onMount } from "svelte";

    export let objectName = "Conversation"

    let localStorage;
    let objects = writable([]);
    let currentObject = writable(null);
    let objectUuid: string;
    let objectSearch: "";

    let tempObjectName: "";
    let editingObjectIndex = -1;

    onMount(async () => {
        // required to access localStorage after mount
        localStorage = window.localStorage;
        getLocalObjects();

    });

    function getLocalObjects() {
        if (localStorage) {
            const storedObjects = JSON.parse(
                localStorage.getItem(objectName),
            );
            if (storedObjects?.length > 0) {
                objects.set(storedObjects);
            }
        }
    }

    function newObject(): string {
        objectUuid = uuidv4();
        objects.update((n) => [
            ...n,
            { id: objectUuid, name: "New " + objectName, messages: [] },
        ]);
        currentObject.set(objectUuid);
        return objectUuid;
    }

    function persistObjects(value: any[]) {
        if (localStorage) {
            localStorage.setItem(objectName, JSON.stringify(value));
        }
    }

    objects.subscribe(persistObjects);

    function startEditingObjectName(index) {
        editingObjectIndex = index;
        tempObjectName = $objects.filter((p) => p.id === index)[0].name;
    }

    function handleObjectKeyDown(event) {
        if (event.key === "Enter") {
            editObjectName(tempObjectName);
        }
    }

    function editObjectName(newName) {
        objects.update((objects) => {
            $objects.filter((p) => p.id === editingObjectIndex)[0].name =
                newName;
            return objects;
        });
        editingObjectIndex = -1;
    }

    function removeObject(id) {
        objects.update((n) => n.filter((c) => c.id !== id));
    }

    function editObject(objectId: number) {
        if (editingObjectIndex === objectId) {
            editObjectName(tempObjectName);
        } else {
            startEditingObjectName(objectId);
        }
    }
</script>

<div class="flex flex-col h-screen">
    <div class="flex flex-grow">
        <div class="w-72 p-4 pb-60 h-full fixed top-20 left-0">
            <button
                class="btn mb-2 w-full justify-between"
                on:click={newObject}
            >
                New {objectName}
                <PlusOutline />
            </button>
            <input
                class="input input-bordered w-full mb-2"
                type="text"
                placeholder="Search"
                bind:value={objectSearch}
            />
            <div
                class="w-[268px] pb-96 h-full fixed top-52 left-0 overflow-y-auto"
            >
                {#if $objects.length > 0}
                    <div class="menu">
                        {#each $objects as object}
                            {#if objectSearch == "" || object.name
                                    .toLowerCase()
                                    .includes(objectSearch)}
                                <div
                                    class="my-1 flex ml-1 flex-row w-full content-center"
                                >
                                    {#if editingObjectIndex === object.id}
                                        <input
                                            class="input input-sm h-[36px] input-bordered w-4/6 flex-nowrap"
                                            type="text"
                                            bind:value={tempObjectName}
                                            on:keydown={handleObjectKeyDown}
                                        />
                                    {:else}
                                        <li class="w-4/6 flex-nowrap">
                                            <button
                                                class="whitespace-nowrap"
                                                on:click={() =>
                                                    currentObject.set(
                                                        object.id,
                                                    )}
                                            >
                                                <span class="overflow-hidden"
                                                    >{object.name}</span
                                                >
                                            </button>
                                        </li>
                                    {/if}
                                    <button
                                        class="btn-ghost w-1/6 px-2.5"
                                        on:click={() => editObject(object.id)}
                                        ><EditOutline />
                                    </button>
                                    <button
                                        class="btn-ghost w-1/6 px-2"
                                        on:click={() => removeObject(object.id)}
                                        ><TrashBinOutline /></button
                                    >
                                </div>
                            {/if}
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
