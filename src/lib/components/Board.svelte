<script lang="ts">
	import { onMount } from 'svelte';
	import type { Board, Note, Drawing } from '$lib/types';
	import StickyNote from './StickyNote.svelte';
	import Toolbar from './Toolbar.svelte';
	import DrawingCanvas from './DrawingCanvas.svelte';
	import ConfirmationModal from './ConfirmationModal.svelte';
	
	export let boardId: string;
	
	// Local state for now (we'll add Convex later)
	let notes: Note[] = [];
	let drawings: Drawing[] = [];
	let isLoaded = false;
	
	// Type-safe board data
	$: boardData = { id: boardId, createdAt: Date.now(), lastAccessedAt: Date.now(), notes, drawings };
	
	onMount(() => {
		// For now, just set loaded to true
		// Later we'll add Convex integration here
		isLoaded = true;
	});
	
	let boardContainer: HTMLDivElement;
	let isCreatingNote = false;
	let selectedColor = 'yellow';
	let showClearModal = false;
	
	// Initialize board on mount
	onMount(() => {
		if (boardId) {
			// The board will be created automatically when we try to access it
		}
	});
	
	// Handle adding a new note
	function addNote(event: MouseEvent) {
		if (!isCreatingNote) return;
		
		const rect = boardContainer.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		const newNote: Note = {
			id: crypto.randomUUID(),
			text: 'New note',
			x,
			y,
			color: selectedColor,
			createdAt: Date.now(),
			updatedAt: Date.now(),
		};
		
		notes = [...notes, newNote];
	}
	
	// Handle drawing creation
	function handleDrawingComplete(points: Array<{x: number, y: number}>, color: string, strokeWidth: number) {
		const newDrawing: Drawing = {
			id: crypto.randomUUID(),
			boardId,
			points,
			color,
			strokeWidth,
			createdAt: Date.now(),
		};
		
		drawings = [...drawings, newDrawing];
	}
	
	// Handle color selection
	function selectColor(color: string) {
		selectedColor = color;
	}
	
	// Handle note updates
	function handleNoteUpdate(updatedNote: Note) {
		notes = notes.map(note => note.id === updatedNote.id ? updatedNote : note);
	}
	
	// Handle note deletion
	function handleNoteDelete(noteId: string) {
		notes = notes.filter(note => note.id !== noteId);
	}
	
	// Handle clear all
	function showClearAllModal() {
		showClearModal = true;
	}
	
	function handleClearConfirm() {
		notes = [];
		drawings = [];
		showClearModal = false;
	}
	
	function handleClearCancel() {
		showClearModal = false;
	}
</script>

<div 
	bind:this={boardContainer}
	class="relative w-full h-full overflow-hidden bg-gray-100"
	on:click={addNote}
	role="button"
	tabindex="0"
>
	<!-- Toolbar -->
	<Toolbar 
		{isCreatingNote}
		{selectedColor}
		on:color-select={(e) => selectColor(e.detail.color)}
		on:toggle-create={(e) => isCreatingNote = e.detail.enabled}
	/>
	
	<!-- Drawing Canvas -->
	<DrawingCanvas 
		{boardId}
		{drawings}
		disabled={isCreatingNote}
		on:drawing-complete={(e) => handleDrawingComplete(e.detail.points, e.detail.color, e.detail.strokeWidth)}
	/>
	
	<!-- Sticky Notes -->
	{#if boardData.notes}
		{#each boardData.notes as note (note.id)}
			<StickyNote 
				{note}
				{boardId}
				on:update={(e) => handleNoteUpdate(e.detail)}
				on:delete={(e) => handleNoteDelete(e.detail)}
			/>
		{/each}
	{/if}
	
	<!-- Clear All Button -->
	<button
		on:click={showClearAllModal}
		class="absolute bottom-4 right-4 z-10 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors font-medium"
		title="Clear all notes and drawings"
	>
		Clear All
	</button>
	
	<!-- Loading state -->
	{#if !isLoaded}
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p class="text-gray-600">Loading board...</p>
			</div>
		</div>
	{/if}
</div>

<!-- Confirmation Modal -->
<ConfirmationModal
	bind:isOpen={showClearModal}
	title="Clear All Content"
	message="Are you sure you want to clear all notes and drawings? This action cannot be undone."
	confirmText="Clear All"
	cancelText="Cancel"
	confirmButtonClass="bg-red-500 hover:bg-red-600"
	on:confirm={handleClearConfirm}
	on:cancel={handleClearCancel}
/>

<style>
	.board-container {
		background-image: 
			radial-gradient(circle, #e5e7eb 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
