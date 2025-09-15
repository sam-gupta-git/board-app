<script lang="ts">
	import { onMount } from 'svelte';
	import type { Board, Note, Drawing, Image } from '$lib/types';
	import StickyNote from './StickyNote.svelte';
	import Toolbar from './Toolbar.svelte';
	import DrawingCanvas from './DrawingCanvas.svelte';
	import ConfirmationModal from './ConfirmationModal.svelte';
	import ImageComponent from './ImageComponent.svelte';
	import DrawingControls from './DrawingControls.svelte';
	
	export let boardId: string;
	
	// Local state for now (we'll add Convex later)
	let notes: Note[] = [];
	let drawings: Drawing[] = [];
	let images: Image[] = [];
	let isLoaded = false;
	let currentTool = 'brush';
	let isDarkMode = false; // Dark mode state
	
	// Type-safe board data
	$: boardData = { id: boardId, createdAt: Date.now(), lastAccessedAt: Date.now(), notes, drawings, fills: [], images };
	
	// Save dark mode to localStorage when it changes
	$: if (typeof window !== 'undefined') {
		localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
	}
	
	onMount(() => {
		// Load dark mode preference from localStorage
		const savedDarkMode = localStorage.getItem('darkMode');
		if (savedDarkMode !== null) {
			isDarkMode = JSON.parse(savedDarkMode);
		}
		
		// For now, just set loaded to true
		// Later we'll add Convex integration here
		isLoaded = true;
	});
	
	let boardContainer: HTMLDivElement;
	let isCreatingNote = false;
	let selectedColor = 'yellow';
	let showClearModal = false;
	let brushSize = 2;
	let brushColor = '#000000';
	
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
	
	// Handle drawing control changes
	function handleBrushSizeChange(event: CustomEvent) {
		brushSize = event.detail.size;
	}
	
	function handleBrushColorChange(event: CustomEvent) {
		brushColor = event.detail.color;
	}
	
	function handleToolChange(event: CustomEvent) {
		currentTool = event.detail.tool;
	}
	
	// Handle color pick
	function handleColorPick(event: CustomEvent) {
		brushColor = event.detail.color;
	}
	
	// Toggle dark mode
	function toggleDarkMode() {
		isDarkMode = !isDarkMode;
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
	class="relative w-full h-full overflow-hidden {isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}"
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
		{brushSize}
		{brushColor}
		{currentTool}
		{isDarkMode}
		on:drawing-complete={(e) => handleDrawingComplete(e.detail.points, e.detail.color, e.detail.strokeWidth)}
		on:color-pick={handleColorPick}
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
				{currentTool}
				on:update={(e) => handleImageUpdate(e.detail)}
				on:delete={(e) => handleImageDelete(e.detail)}
				on:color-pick={handleColorPick}
			/>
		{/each}
	{/if}
	
	<!-- Drawing Controls -->
	<DrawingControls
		{brushSize}
		{brushColor}
		{currentTool}
		on:brush-size-change={handleBrushSizeChange}
		on:brush-color-change={handleBrushColorChange}
		on:tool-change={handleToolChange}
	/>
	
	<!-- Action Buttons -->
	<div class="absolute bottom-4 right-4 z-10 flex gap-2">
		<!-- Dark Mode Toggle Button -->
		<button
			on:click={toggleDarkMode}
			class="p-3 rounded-lg shadow-lg transition-colors font-medium {isDarkMode 
				? 'bg-yellow-500 text-white hover:bg-yellow-600' 
				: 'bg-gray-800 text-white hover:bg-gray-700'}"
			title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{#if isDarkMode}
				<!-- Sun Icon (Light Mode) -->
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			{:else}
				<!-- Moon Icon (Dark Mode) -->
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
				</svg>
			{/if}
		</button>
		
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
