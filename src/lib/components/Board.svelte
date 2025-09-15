<script lang="ts">
	import { onMount } from 'svelte';
	import type { Board, Note, Drawing, Image } from '$lib/types';
	import StickyNote from './StickyNote.svelte';
	import Toolbar from './Toolbar.svelte';
	import DrawingCanvas from './DrawingCanvas.svelte';
	import ConfirmationModal from './ConfirmationModal.svelte';
	import ImageComponent from './ImageComponent.svelte';
	
	export let boardId: string;
	
	// Local state for now (we'll add Convex later)
	let notes: Note[] = [];
	let drawings: Drawing[] = [];
	let images: Image[] = [];
	let isLoaded = false;
	
	// Type-safe board data
	$: boardData = { id: boardId, createdAt: Date.now(), lastAccessedAt: Date.now(), notes, drawings, images };
	
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
		images = [];
		showClearModal = false;
	}
	
	function handleClearCancel() {
		showClearModal = false;
	}
	
	// Handle image upload
	function handleImageUpload(event: CustomEvent) {
		const { src } = event.detail;
		
		// Create a temporary image to get dimensions
		const img = new Image();
		img.onload = () => {
			const newImage: Image = {
				id: crypto.randomUUID(),
				boardId,
				src,
				x: 100, // Default position
				y: 100,
				width: Math.min(img.width, 300), // Max width of 300px
				height: Math.min(img.height, 300), // Max height of 300px
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};
			
			images = [...images, newImage];
		};
		img.src = src;
	}
	
	// Handle image updates
	function handleImageUpdate(updatedImage: Image) {
		images = images.map(img => img.id === updatedImage.id ? updatedImage : img);
	}
	
	// Handle image deletion
	function handleImageDelete(imageId: string) {
		images = images.filter(img => img.id !== imageId);
	}
	
	// Handle share
	async function shareBoard() {
		const boardUrl = window.location.href;
		
		// Check if Web Share API is available
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Board App - Collaborative Board',
					text: 'Check out this collaborative board!',
					url: boardUrl
				});
			} catch (error) {
				// User cancelled or error occurred, fall back to clipboard
				await copyToClipboard(boardUrl);
			}
		} else {
			// Fall back to clipboard copy
			await copyToClipboard(boardUrl);
		}
	}
	
	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			// You could add a toast notification here
			alert('Board link copied to clipboard!');
		} catch (error) {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
			alert('Board link copied to clipboard!');
		}
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
		on:image-upload={handleImageUpload}
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
	
	<!-- Images -->
	{#if boardData.images}
		{#each boardData.images as image (image.id)}
			<ImageComponent 
				{image}
				{boardId}
				on:update={(e) => handleImageUpdate(e.detail)}
				on:delete={(e) => handleImageDelete(e.detail)}
			/>
		{/each}
	{/if}
	
	<!-- Action Buttons -->
	<div class="absolute bottom-4 right-4 z-10 flex gap-2">
		<!-- Share Button -->
		<button
			on:click={shareBoard}
			class="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors font-medium"
			title="Share this board"
		>
			Share
		</button>
		
		<!-- Clear All Button -->
		<button
			on:click={showClearAllModal}
			class="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors font-medium"
			title="Clear all notes and drawings"
		>
			Clear All
		</button>
	</div>
	
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
