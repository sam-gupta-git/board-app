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
	
	function handleImageUpload(event: Event) {
		event.stopPropagation();
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				const src = e.target?.result as string;
				dispatch('image-upload', { src, file });
			};
			reader.readAsDataURL(file);
		}
		
		// Reset input value so the same file can be selected again
		input.value = '';
	}
</script>

<div class="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4">
	<!-- Add Note Button -->
	<button
		on:click={(e) => toggleCreate(e)}
		class="p-3 rounded-lg font-medium transition-colors {isCreatingNote 
			? 'bg-blue-600 text-white' 
			: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
		title={isCreatingNote ? 'Cancel adding notes' : 'Add sticky note'}
	>
		{#if isCreatingNote}
			<!-- Cancel Icon -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		{:else}
			<!-- Add Note Icon -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
			</svg>
		{/if}
	</button>
	
	<!-- Image Upload Button -->
	<label class="p-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors cursor-pointer" title="Upload image">
		<!-- Upload Icon -->
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
		</svg>
		<input
			type="file"
			accept="image/*"
			on:change={handleImageUpload}
			class="hidden"
		/>
	</label>
	
	<!-- Color Picker - Only show when creating notes -->
	{#if isCreatingNote}
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
	{/if}
	
	<!-- Instructions -->
	{#if isCreatingNote}
		<div class="text-sm text-gray-600 ml-4">
			Click anywhere on the board to add a note
		</div>
	{/if}
</div>
