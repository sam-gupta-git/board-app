<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let brushSize: number = 2;
	export let brushColor: string = '#000000';
	export let currentTool: string = 'brush';
	
	const dispatch = createEventDispatcher();
	
	// Panel visibility state
	let isPanelVisible = true;
	
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
	
	function selectTool(tool: string) {
		currentTool = tool;
		dispatch('tool-change', { tool });
	}
	
	function togglePanel() {
		isPanelVisible = !isPanelVisible;
	}
</script>

<div class="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg flex items-center">
	<!-- Shutter Button -->
	<button
		on:click={togglePanel}
		class="p-3 rounded-l-lg transition-colors {isPanelVisible 
			? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
			: 'bg-blue-500 text-white hover:bg-blue-600'}"
		title={isPanelVisible ? 'Hide tools panel' : 'Show tools panel'}
	>
		{#if isPanelVisible}
			<!-- Hide Icon -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
			</svg>
		{:else}
			<!-- Show Icon -->
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
			</svg>
		{/if}
	</button>
	
	<!-- Tools Panel (conditionally visible) -->
	{#if isPanelVisible}
		<div class="flex items-center gap-4 p-4">
			<!-- Tool Selection -->
			<div class="flex items-center gap-2">
				<span class="text-sm text-gray-600 font-medium">Tool:</span>
				<div class="flex gap-1">
					<button
						on:click={() => selectTool('brush')}
						class="p-2 rounded-lg transition-colors {currentTool === 'brush' 
							? 'bg-blue-500 text-white' 
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						title="Brush tool"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
						</svg>
					</button>
					<button
						on:click={() => selectTool('color-picker')}
						class="p-2 rounded-lg transition-colors {currentTool === 'color-picker' 
							? 'bg-blue-500 text-white' 
							: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
						title="Color picker tool"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
					</button>
				</div>
			</div>
			
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
	{/if}
</div>
