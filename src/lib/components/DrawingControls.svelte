<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let brushSize: number = 2;
	export let brushColor: string = '#000000';
	
	const dispatch = createEventDispatcher();
	
	const brushSizes = [1, 2, 4, 8, 12, 16, 20];
	const colors = [
		{ name: 'black', value: '#000000', label: 'Black' },
		{ name: 'red', value: '#ef4444', label: 'Red' },
		{ name: 'blue', value: '#3b82f6', label: 'Blue' },
		{ name: 'green', value: '#10b981', label: 'Green' },
		{ name: 'yellow', value: '#f59e0b', label: 'Yellow' },
		{ name: 'purple', value: '#8b5cf6', label: 'Purple' },
		{ name: 'pink', value: '#ec4899', label: 'Pink' },
		{ name: 'orange', value: '#f97316', label: 'Orange' },
		{ name: 'gray', value: '#6b7280', label: 'Gray' },
		{ name: 'white', value: '#ffffff', label: 'White' }
	];
	
	function updateBrushSize(size: number) {
		brushSize = size;
		dispatch('brush-size-change', { size });
	}
	
	function updateBrushColor(color: string) {
		brushColor = color;
		dispatch('brush-color-change', { color });
	}
	
	function handleCustomColor(event: Event) {
		const input = event.target as HTMLInputElement;
		updateBrushColor(input.value);
	}
</script>

<div class="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4">
	<!-- Brush Size Controls -->
	<div class="flex items-center gap-2">
		<span class="text-sm text-gray-600 font-medium">Size:</span>
		<div class="flex gap-1">
			{#each brushSizes as size}
				<button
					on:click={() => updateBrushSize(size)}
					class="w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center {brushSize === size 
						? 'border-blue-500 bg-blue-50' 
						: 'border-gray-300 hover:border-gray-400'}"
					title="{size}px brush size"
				>
					<div 
						class="rounded-full bg-gray-800"
						style="width: {Math.min(size, 12)}px; height: {Math.min(size, 12)}px;"
					></div>
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Brush Color Controls -->
	<div class="flex items-center gap-2">
		<span class="text-sm text-gray-600 font-medium">Color:</span>
		<div class="flex gap-1">
			{#each colors as color}
				<button
					on:click={() => updateBrushColor(color.value)}
					class="w-8 h-8 rounded-full border-2 transition-all {brushColor === color.value 
						? 'border-gray-800 scale-110' 
						: 'border-gray-300 hover:scale-105'}"
					style="background-color: {color.value};"
					title={color.label}
				></button>
			{/each}
		</div>
		<!-- Custom Color Picker -->
		<input
			type="color"
			value={brushColor}
			on:input={handleCustomColor}
			class="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer"
			title="Custom color"
		/>
	</div>
</div>
