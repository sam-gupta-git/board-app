<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let isCreatingNote: boolean = false;
	export let selectedColor: string = 'yellow';
	
	const dispatch = createEventDispatcher();
	
	const colors = [
		{ name: 'yellow', label: 'Yellow', class: 'bg-sticky-yellow' },
		{ name: 'pink', label: 'Pink', class: 'bg-sticky-pink' },
		{ name: 'blue', label: 'Blue', class: 'bg-sticky-blue' },
		{ name: 'green', label: 'Green', class: 'bg-sticky-green' },
		{ name: 'purple', label: 'Purple', class: 'bg-sticky-purple' },
	];
	
	function selectColor(color: string, event: MouseEvent) {
		event.stopPropagation();
		dispatch('color-select', { color });
	}
	
	function toggleCreate(event: MouseEvent) {
		event.stopPropagation();
		dispatch('toggle-create', { enabled: !isCreatingNote });
	}
</script>

<div class="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4">
	<!-- Add Note Button -->
	<button
		on:click={(e) => toggleCreate(e)}
		class="px-4 py-2 rounded-lg font-medium transition-colors {isCreatingNote 
			? 'bg-blue-600 text-white' 
			: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
	>
		{isCreatingNote ? 'Cancel' : 'Add Note'}
	</button>
	
	<!-- Color Picker -->
	<div class="flex items-center gap-2">
		<span class="text-sm text-gray-600">Color:</span>
		<div class="flex gap-1">
			{#each colors as color}
				<button
					on:click={(e) => selectColor(color.name, e)}
					class="w-8 h-8 rounded-full border-2 transition-all {color.class} {selectedColor === color.name 
						? 'border-gray-800 scale-110' 
						: 'border-gray-300 hover:scale-105'}"
					title={color.label}
				></button>
			{/each}
		</div>
	</div>
	
	<!-- Instructions -->
	{#if isCreatingNote}
		<div class="text-sm text-gray-600 ml-4">
			Click anywhere on the board to add a note
		</div>
	{/if}
</div>
