<script lang="ts">
	import { onMount } from 'svelte';
	import { useQuery, useMutation } from 'convex/react';
	import { api } from '../../../convex/_generated/api';
	import type { Board, Note, Drawing } from '$lib/types';
	import StickyNote from './StickyNote.svelte';
	import Toolbar from './Toolbar.svelte';
	import DrawingCanvas from './DrawingCanvas.svelte';
	
	export let boardId: string;
	
	// Convex queries and mutations
	const board = useQuery(api.boards.getBoard, { boardId });
	const createNote = useMutation(api.notes.createNote);
	const createDrawing = useMutation(api.drawings.createDrawing);
	
	// Type-safe board data
	$: boardData = board || { id: boardId, createdAt: Date.now(), lastAccessedAt: Date.now(), notes: [], drawings: [] };
	
	let boardContainer: HTMLDivElement;
	let isCreatingNote = false;
	let selectedColor = 'yellow';
	
	// Initialize board on mount
	onMount(() => {
		if (boardId) {
			// The board will be created automatically when we try to access it
		}
	});
	
	// Handle adding a new note
	async function addNote(event: MouseEvent) {
		if (isCreatingNote) return;
		
		const rect = boardContainer.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		
		try {
			await createNote({
				boardId,
				text: 'New note',
				x,
				y,
				color: selectedColor,
			});
		} catch (error) {
			console.error('Failed to create note:', error);
		}
	}
	
	// Handle drawing creation
	async function handleDrawingComplete(points: Array<{x: number, y: number}>, color: string, strokeWidth: number) {
		try {
			await createDrawing({
				boardId,
				points,
				color,
				strokeWidth,
			});
		} catch (error) {
			console.error('Failed to create drawing:', error);
		}
	}
	
	// Handle color selection
	function selectColor(color: string) {
		selectedColor = color;
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
		on:drawing-complete={(e) => handleDrawingComplete(e.detail.points, e.detail.color, e.detail.strokeWidth)}
	/>
	
	<!-- Sticky Notes -->
	{#if boardData.notes}
		{#each boardData.notes as note (note.id)}
			<StickyNote 
				{note}
				{boardId}
			/>
		{/each}
	{/if}
	
	<!-- Loading state -->
	{#if !board}
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p class="text-gray-600">Loading board...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.board-container {
		background-image: 
			radial-gradient(circle, #e5e7eb 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
